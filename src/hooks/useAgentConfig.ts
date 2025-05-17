"use client";

import { Rule } from "@/services/agents/claude/types";
import { useState, useEffect, useRef } from "react";
import { useUser } from '@clerk/nextjs';
import { useErrorContext } from '@/hooks/useErrorContext';

interface Header {
  key: string;
  value: string;
}

interface SavedAgent {
  id: string;
  name: string;
  agentEndpoint: string;
  headers: Record<string, string>;
}

export function useAgentConfig() {
  const [testName, setTestName] = useState("");
  const [agentEndpoint, setAgentEndpoint] = useState("");
  const [headers, setHeaders] = useState<Header[]>([{ key: "", value: "" }]);
  const [body, setbody] = useState("");
  const [manualResponse, setManualResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [responseTime, setResponseTime] = useState(0);
  const [rules, setRules] = useState<Rule[]>([]);
  const [savedAgents, setSavedAgents] = useState<SavedAgent[]>([]);
  const [ruleTemplates, setRuleTemplates] = useState<Record<string, Rule[]>>({});
  const [agentDescription, setAgentDescription] = useState("");
  const [userDescription, setUserDescription] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentAgentId, setCurrentAgentId] = useState<string | null>(null);
  const { isSignedIn, user } = useUser();
  const [orgId, setOrgId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const errorContext = useErrorContext();
  
  // Add refs to track if initial fetches are complete
  const initialAgentFetchComplete = useRef(false);
  const initialOrgDetailsFetchComplete = useRef(false);

  // Only fetch agents on initial mount
  useEffect(() => {
    if (!initialAgentFetchComplete.current) {
      const fetchAgents = async () => {
        try {
          setLoading(true);
          const res = await fetch("/api/tools/agent-config");
          const result = await res.json();
          const data = result.data;
          
          // Make sure we have valid data
          if (Array.isArray(data)) {
            setSavedAgents(data.map((cfg: any) => ({
              id: cfg.id,
              name: cfg.name,
              agentEndpoint: cfg.endpoint,
              headers: cfg.headers
            })));
          } else {
            console.error("Unexpected data format:", data);
          }
          
          initialAgentFetchComplete.current = true;
        } catch (error) {
          console.error("Error fetching agents:", error);
          errorContext.handleError(error);
        } finally {
          setLoading(false);
        }
      };
      
      fetchAgents();
    }
  }, [errorContext]);

  // Fix for the user details fetch
  useEffect(() => {
    if (isSignedIn && user && user.id && !initialOrgDetailsFetchComplete.current) {
      const loadOrgDetails = async () => {
        try {
          const res = await fetch(`/api/auth/user-details?clerkId=${user.id}`);
          if (!res.ok) {
            throw new Error(`API error: ${res.status}`);
          }
          
          const result = await res.json();
          const data = result.data;
          
          if (data && data.organization) {
            setOrgId(data.organization.id);
            setUserId(data.profile?.id || null);
          }
          
          initialOrgDetailsFetchComplete.current = true;
        } catch (error) {
          console.error("Error loading org details:", error);
          errorContext.handleError(error);
        }
      };
      
      loadOrgDetails();
    }
  }, [isSignedIn, user, errorContext]);
  
  const loadAgent = async (agentId: string) => {
    try {
      setLoading(true);
      
      const res = await fetch(`/api/tools/agent-config?id=${agentId}`);
      if (!res.ok) {
        throw new Error(`Failed to fetch agent config: ${res.status}`);
      }
      
      const result = await res.json();
      const data = result.data;
      
      if (!data) {
        throw new Error("No data returned from API");
      }
      
      setTestName(data.name || "");
      setAgentEndpoint(data.endpoint || "");
      setHeaders(
        Object.entries(data.headers || {}).map(([key, value]) => ({
          key,
          value: value as string,
        }))
      );          
      setAgentDescription(data.agentDescription || "");
      setUserDescription(data.userDescription || "");
      setRules(data.rules || []);
      setbody(typeof data.inputFormat === 'object' ? JSON.stringify(data.inputFormat, null, 2) : data.inputFormat || "");
      setManualResponse(typeof data.latestOutput?.responseData === 'object'
        ? JSON.stringify(data.latestOutput.responseData, null, 2)
        : data.latestOutput?.responseData || ""
      );
      setResponseTime(data.latestOutput?.responseTime || 0);
      setIsEditMode(true);
      setCurrentAgentId(data.id);
      
      return true;
    } catch (error) {
      console.error("Error loading agent:", error);
      errorContext.handleError(error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const testManually = async () => {
    try {
      setLoading(true);
      const startTime = Date.now();
      
      let parsedBody;
      try {
        parsedBody = JSON.parse(body);
      } catch (parseError) {
        throw new Error("Invalid JSON in body");
      }

      const response = await fetch(agentEndpoint, {
        method: "POST",
        headers: Object.fromEntries(headers.map(h => [h.key, h.value])),
        body: JSON.stringify(parsedBody)
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const result = await response.json();
      setManualResponse(JSON.stringify(result, null, 2));
      setResponseTime(Date.now() - startTime);
      
      return true;
    } catch (error) {
      console.error("Error testing manually:", error);
      errorContext.handleError(error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const saveTest = async () => {
    try {
      setLoading(true);
      
      const payload = {
        id: isEditMode ? currentAgentId : undefined,
        name: testName,
        endpoint: agentEndpoint,
        headers: Object.fromEntries(headers.map(h => [h.key, h.value])),
        input: body,
        agent_response: manualResponse,
        rules,
        responseTime,
        agentDescription,
        userDescription,
        timestamp: new Date().toISOString(),
        org_id: orgId,
        created_by: userId
      };
    
      const res = await fetch("/api/tools/agent-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      
      if (!res.ok) {
        throw new Error(`Failed to save agent config: ${res.status}`);
      }
      
      // After saving, update the savedAgents list
      if (!isEditMode) {
        // If it's a new agent, refetch the agent list
        initialAgentFetchComplete.current = false;
        
        // Refetch agents immediately
        const agentsRes = await fetch("/api/tools/agent-config");
        const agentsResult = await agentsRes.json();
        const agentsData = agentsResult.data;
        
        if (Array.isArray(agentsData)) {
          setSavedAgents(agentsData.map((cfg: any) => ({
            id: cfg.id,
            name: cfg.name,
            agentEndpoint: cfg.endpoint,
            headers: cfg.headers
          })));
        }
      }
      
      setIsEditMode(false);
      return true;
    } catch (error) {
      console.error("Error saving test:", error);
      errorContext.handleError(error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    testName, setTestName,
    agentEndpoint, setAgentEndpoint,
    headers, setHeaders,
    body, setbody,
    manualResponse, setManualResponse,
    loading, responseTime, setResponseTime,
    rules, setRules,
    savedAgents, ruleTemplates,
    agentDescription, setAgentDescription,
    userDescription, setUserDescription,
    isEditMode, setIsEditMode,
    currentAgentId,
    loadAgent, testManually, saveTest,
    error: errorContext.error,
    clearError: errorContext.clearError
  };
}