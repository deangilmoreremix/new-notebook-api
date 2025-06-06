import type {
  ProcessRequest,
  CreatePodcastCustomVoicesRequest,
  CreatePodcastCustomScriptRequest,
  SeparateSpeakersRequest,
  CreateShortRequest,
  Voice,
  CloneVoiceResponse,
} from "./types";
import {
  ContentStatus,
  handleApiError,
  handleApiResponse,
  ModifyPodcastRequest,
  ModifyPodcastResponse,
  ProcessResponse,
  validateApiConfig,
} from "./types";
import { API_URL, API_KEY } from "../constants";
import { API_CONSTANTS } from "./constants";

// API Configuration
// API configuration values are imported from lib/constants to ensure
// sensible defaults during testing when environment variables may be unset.

// API Endpoints
const ENDPOINTS = {
  // Core content endpoints
  create: "/content/create",
  status: "/content/status",
  getVoices: "/content/getvoices",
  cloneVoice: "/content/clonevoice",
  createPodcastCustomVoices: "/content/createpodcastcustomvoices",
  createPodcastCustomScript: "/content/createpodcastcustomscript",
  separateSpeakers: "/content/separatespeakersaudio",
  createShort: "/video/CreateShorts",
  usage: "/content/usage",
  list: "/content/list",
  webhook: "/content/webhook",
  getAvatars: "/video/GetAvatars",

  // Studio endpoints
  studio: {
    analyze: "/studio/analyze",
    generate: "/studio/generate",
    compare: "/studio/compare",
    export: "/studio/export",
    tools: {
      summarize: "/studio/tools/summarize",
      highlight: "/studio/tools/highlight",
      annotate: "/studio/tools/annotate",
      search: "/studio/tools/search",
    },
  },
} as const;

// Determine if we should use mock responses in development
const OFFLINE_MODE = process.env.NODE_ENV === "development";

interface GenerationOptions {
  format?: string;
  tone?: string;
  length?: string;
  voice1?: string;
  voice2?: string;
  speakers?: {
    host1: string;
    host2: string;
  };
  includeCitations?: boolean;
}

interface VoiceCloneOptions {
  name: string;
  audioFile: File;
  gender?: "male" | "female";
  language?: string;
}

interface Avatar {
  Id: number;
  name: string;
  imageUrl: string;
  videoUrl: string;
  token: string | null;
  createdOn: string;
  voiceId: string | null;
}

// Mock response generator for offline mode
function mockResponse(request: any): any {
  const requestId = `mock_${Date.now()}`;

  // Store mock request for status polling
  if (typeof window !== "undefined") {
    localStorage.setItem(
      requestId,
      JSON.stringify({
        status: "completed",
        content: `Mock ${request.outputType} response for offline mode`,
      })
    );
  }

  return {
    request_id: requestId,
  };
}

export const autoContentApi = {
  async createDeepDiveContent(
    resources: string[],
    text: string,
    options: {
      outputType?: "text" | "audio";
      includeCitations?: boolean;
      customization?: any;
    } = {}
  ) {
    try {
      const url = `/api/content`;
      const headers = {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      };

      const payload = {
        resources: resources.map((r) => ({
          content: r,
          type: "website",
        })),
        text,
        includeCitations: options.includeCitations ?? false,
        outputType: "deep_dive",
        outputFormat: options.outputType || "text",
        customization: options.customization,
      };

      const response = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      }).catch((error) => {
        console.error("Network error:", error);
        throw new Error(`Network error: ${error.message}`);
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error("API error response:", errorData);
        throw new Error(`AutoContent API error: ${errorData}`);
      }

      const data = await response.json();

      // Handle request_id for polling if needed
      if (data.request_id) {
        const result = await this.pollStatus(data.request_id);
        if (result.status === "completed") {
          return {
            content: result.content,
            request_id: data.request_id,
            audio_url: result.audio_url,
            metadata: result.metadata,
          };
        }
        throw new Error("Content generation failed or timed out");
      }
      console.log("Content generation", data);
      return data;
    } catch (error) {
      console.error("Deep dive generation error:", {
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
        resourceCount: resources.length,
      });
      throw error;
    }
  },

  async modifyPodcast(request: ModifyPodcastRequest): Promise<ModifyPodcastResponse> {
    try {
      console.log("Sending modifyPodcast request:", request);
  
      const response = await fetch(`/api/modifypodcast`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(request),
      });
  
      console.log("Received response:", response);
  
      if (!response.ok) {
        const errorData = await response.text();
        console.error("Error response data:", errorData);
        throw new Error(`Failed to modify podcast: ${errorData}`);
      }
  
      const data = await response.json();
      console.log("Parsed response data:", data);
  
      // If the response contains a request_id, start polling
      if (data.request_id) {
        console.log("Starting polling for request_id:", data.request_id);
        return await this.pollStatus(data.request_id);
      }
  
      return data;
    } catch (error) {
      console.error("Podcast modification error:", {
        message: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : null,
      });
      throw error;
    }
  },

  async createPodcastCustomVoices(
    request: CreatePodcastCustomVoicesRequest
  ): Promise<ProcessResponse> {
    try {
      const response = await fetch(`/api/createpodcastcustomvoices`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(request),
      });

      return handleApiResponse(response, "createPodcastCustomVoices");
    } catch (error) {
      return handleApiError(error, "createPodcastCustomVoices");
    }
  },

  async createPodcastCustomScript(
    request: CreatePodcastCustomScriptRequest
  ): Promise<ProcessResponse> {
    try {
      const response = await fetch(`/api/createpodcastcustomscript`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(request),
      });

      return handleApiResponse(response, "createPodcastCustomScript");
    } catch (error) {
      return handleApiError(error, "createPodcastCustomScript");
    }
  },

  async separateSpeakers(
    request: SeparateSpeakersRequest
  ): Promise<ProcessResponse> {
    try {
      const response = await fetch(`/api/separatespeakersaudio`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(request),
      });

      return handleApiResponse(response, "separateSpeakers");
    } catch (error) {
      return handleApiError(error, "separateSpeakers");
    }
  },

  async createShort(
    request: CreateShortRequest
  ): Promise<ProcessResponse> {
    try {
      const response = await fetch(`/api/createshorts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create short');
      }

      const data = await response.json();
      return {
        content: data.finalResult?.content || '',
        status: 'completed',
        request_id: data.initialResponse?.request_id
      };
    } catch (error) {
      console.error('Error in createShort:', error);
      throw error;
    }
  },
  

  async cloneVoice(audioFile: File, name: string): Promise<Voice> {
    try {
      if (!API_KEY) {
        throw new Error("API key is missing");
      }

      // Validate file size
      if (audioFile.size > API_CONSTANTS.MAX_FILE_SIZE) {
        throw new Error("Audio file too large");
      }

      // Validate file type
      if (!audioFile.type.startsWith("audio/")) {
        throw new Error("Invalid file type");
      }

      const formData = new FormData();
      formData.append("audio", audioFile);
      formData.append("name", name);

      const response = await fetch(`/api/clonevoice`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          Accept: "application/json",
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Voice cloning failed: ${errorData}`);
      }

      const result = await response.json() as CloneVoiceResponse;

      // Poll for completion if needed
      if (result.request_id) {
        let attempts = 0;
        const maxAttempts = 30; // 5 minutes maximum (10 seconds * 30)
        const pollInterval = 10000; // 10 seconds

        while (attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, pollInterval));
          attempts++;

          const statusResponse = await fetch(`/api/clonevoice/status?request_id=${result.request_id}`, {
            headers: {
              Authorization: `Bearer ${API_KEY}`,
              Accept: "application/json",
            },
          });

          if (!statusResponse.ok) {
            throw new Error("Failed to check cloning status");
          }

          const statusData = await statusResponse.json() as CloneVoiceResponse;

          if (statusData.status === "completed") {
            return {
              id: statusData.voice_id,
              name: statusData.name,
              language: statusData.language || "en-US",
              isCloned: true,
              sourceAudio: statusData.source_audio,
              preview_url: statusData.preview_url,
              gender: statusData.gender || "unknown",
              accent: statusData.accent || "neutral",
              settings: {
                speed_range: { min: 0.8, max: 1.2 },
                pitch_range: { min: 0.8, max: 1.2 },
                emphasis_levels: ["light", "moderate", "strong"],
                emotion_intensities: ["low", "medium", "high"],
              },
            };
          } else if (statusData.status === "failed") {
            throw new Error(statusData.error || "Voice cloning failed");
          }
        }

        throw new Error("Voice cloning timed out");
      }

      // If no request_id, assume immediate completion
      return {
        id: result.voice_id,
        name: result.name,
        language: result.language || "en-US",
        isCloned: true,
        sourceAudio: result.source_audio,
        preview_url: result.preview_url,
        gender: result.gender || "unknown",
        accent: result.accent || "neutral",
        settings: {
          speed_range: { min: 0.8, max: 1.2 },
          pitch_range: { min: 0.8, max: 1.2 },
          emphasis_levels: ["light", "moderate", "strong"],
          emotion_intensities: ["low", "medium", "high"],
        },
      };
    } catch (error) {
      console.error("Voice cloning error:", {
        error: error instanceof Error ? error.message : "Unknown error",
        fileName: audioFile.name,
        fileSize: audioFile.size,
        fileType: audioFile.type,
        timestamp: new Date().toISOString(),
      });
      throw error;
    }
  },

  async getAvailableVoices(): Promise<Voice[]> {
    try {
      console.log("getAvailableVoices() - Start");

      if (!API_KEY) {
        console.warn("API key missing - using default voices");
        return this.getDefaultVoices();
      }

      // Retry configuration
      const maxRetries = 3;
      const retryDelay = 1000;
      let attempt = 0;

      try {
        // Retry loop
        while (attempt < maxRetries) {
          console.log(`Attempt ${attempt + 1} to fetch voices`);

          // Add exponential backoff delay after first attempt
          if (attempt > 0) {
            const delay = retryDelay * Math.pow(2, attempt - 1);
            console.log(`Retry delay: ${delay}ms`);
            await new Promise((resolve) => setTimeout(resolve, delay));
          }

          try {
            // Check network connectivity
            if (typeof window !== "undefined" && !window.navigator.onLine) {
              console.warn("No internet connection, using default voices");
              return this.getDefaultVoices();
            }

            console.log("Fetching voices from API...");

            const response = await fetch("/api/voices", {
              signal: AbortSignal.timeout(10000),
            });

            console.log(`Response Status: ${response.status}`);

            if (!response.ok) {
              const errorText = await response.text();
              console.warn(
                `Voice API error: ${response.status} - ${errorText}`
              );
              return this.getDefaultVoices();
            }

            const voices = await response.json();
            console.log("API Response Data:", voices);

            // Ensure voice data format is correct
            const voiceData = Array.isArray(voices) ? voices : voices?.data;

            if (!Array.isArray(voiceData)) {
              throw new Error("Invalid voice data format");
            }

            // console.log(`Total voices received: ${voiceData.length}`);

            // // Log the raw response data
            // console.log("Raw Voices Data:", JSON.stringify(voiceData, null, 2));

            // Process voices
            const englishVoices = voiceData
              .map((voice) => {
                const formattedVoice = {
                  id: voice.id.toString(),
                  name: voice.name,
                  language: "en-US", // English only
                  gender:
                    voice.gender.toLowerCase() === "f" ? "Female" : "Male",
                  isCloned: false, // Default value
                  accent: "neutral", // Default value
                  preview_url: voice.sampleUrl || null, // Check if sampleUrl exists
                  style: "neutral", // Default value
                  age: "adult", // Default value
                  emotion: "neutral", // Default value
                  speed_range: { min: 0.8, max: 1.2 }, // Default value
                  pitch_range: { min: 0.8, max: 1.2 }, // Default value
                  emphasis_levels: ["light", "moderate", "strong"], // Default value
                  emotion_intensities: ["low", "medium", "high"], // Default value
                };

                // Log individual voice to check if preview_url is present
                // console.log(
                //   `Processed Voice - Name: ${formattedVoice.name}, Preview URL: ${formattedVoice.preview_url}`
                // );

                return formattedVoice;
              })
              .filter((voice) => {
                if (!voice.name || !voice.id) {
                  console.warn(
                    `Skipping invalid voice: ${JSON.stringify(voice)}`
                  );
                  return false;
                }
                return true;
              });

            // Log final filtered list
            // console.log(
            //   "Final Filtered Voices:",
            //   JSON.stringify(englishVoices, null, 2)
            // );

            // Check if any voices are missing preview URLs
            const voicesWithoutPreview = englishVoices.filter(
              (voice) => !voice.preview_url
            );
            if (voicesWithoutPreview.length > 0) {
              console.warn(
                "Some voices are missing preview URLs:",
                JSON.stringify(voicesWithoutPreview, null, 2)
              );
            }

            // Return the processed voices
            if (englishVoices.length === 0) {
              throw new Error("No valid voices found");
            }

            console.log("Returning valid English voices");
            return englishVoices;
          } catch (error) {
            console.error("Error fetching voices:", error);

            const isNetworkError =
              error instanceof Error &&
              (error.name === "TypeError" ||
                error.name === "AbortError" ||
                error.message.includes("Failed to fetch") ||
                error.message.includes("Network request failed") ||
                error.message.includes("No internet connection"));

            // Only retry on network errors
            if (!isNetworkError) {
              throw error; // Don't retry non-network errors
            }

            attempt++;

            if (attempt >= maxRetries || !window.navigator.onLine) {
              throw new Error(`Voice API failed after ${maxRetries} attempts`);
            }

            // Wait before retrying
            console.log("Retrying API call...");
            await new Promise((resolve) =>
              setTimeout(resolve, retryDelay * Math.pow(2, attempt))
            );
          }
        }

        throw new Error("Failed to fetch voices");
      } catch (error) {
        // If all retries failed, fall back to default voices
        console.warn("Falling back to default voices due to error:", error);
        return this.getDefaultVoices();
      }
    } catch (error) {
      console.error("Voice initialization error:", error);
      return this.getDefaultVoices();
    } finally {
      console.log("getAvailableVoices() - End");
    }
  },

  getDefaultVoices(): Voice[] {
    const defaultVoices = [
      // American English
      {
        id: "en_us_001",
        name: "Matthew",
        language: "en-US",
        gender: "m",
        accent: "american",
      },
      {
        id: "en_us_002",
        name: "Joanna",
        language: "en-US",
        gender: "f",
        accent: "american",
      },
      {
        id: "en_us_003",
        name: "Ivy",
        language: "en-US",
        gender: "f",
        accent: "american",
      },
      {
        id: "en_us_004",
        name: "Justin",
        language: "en-US",
        gender: "m",
        accent: "american",
      },
      // British English
      {
        id: "en_uk_001",
        name: "Emma",
        language: "en-GB",
        gender: "f",
        accent: "british",
      },
      {
        id: "en_uk_002",
        name: "Brian",
        language: "en-GB",
        gender: "m",
        accent: "british",
      },
      // Australian English
      {
        id: "en_au_001",
        name: "Nicole",
        language: "en-AU",
        gender: "f",
        accent: "australian",
      },
      {
        id: "en_au_002",
        name: "Russell",
        language: "en-AU",
        gender: "m",
        accent: "australian",
      },
    ].map((voice) => ({
      ...voice,
      preview_url: null, // Default voices don't have preview URLs
    }));
    return defaultVoices;
  },

  

  async pollStatus(requestId: string, maxAttempts = 30, interval = 2000) {
    let attempts = 0;

    if (!API_KEY) {
      throw new Error("API key is missing. Please check your .env.local file.");
    }

    while (attempts < maxAttempts) {
      const response = await fetch(`${API_URL}/content/status/${requestId}`, {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to check status: ${response.statusText}`);
      }

      const result = await response.json();

      if (result.status === "completed" || result.status === "failed") {
        return result;
      }

      attempts++;
      await new Promise((resolve) => setTimeout(resolve, interval));
    }

    throw new Error("Operation timed out");
  },

  async uploadSource(file: File): Promise<ProcessResponse> {
    try {
      if (!validateApiConfig()) {
        throw new Error("API configuration is invalid");
      }

      // Validate file
      if (file.size > API_CONSTANTS.MAX_FILE_SIZE) {
        throw new Error("File too large (max 50MB)");
      }

      const validTypes = ["application/pdf", "text/plain", "text/markdown"];
      if (!validTypes.includes(file.type)) {
        throw new Error("Invalid file type. Supported: PDF, TXT, MD");
      }

      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`${API_URL}/content/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          "User-Agent": "SmartNotebook/1.0",
        },
        body: formData,
      });

      return handleApiResponse(response, "uploadSource");
    } catch (error) {
      console.error("Source upload error:", error);
      return handleApiError(error, "uploadSource");
    }
  },

  async processContent(
    content: string,
    type: string
  ): Promise<ProcessResponse> {
    try {
      if (!validateApiConfig()) {
        if (OFFLINE_MODE) {
          return mockResponse({ type: "process", content });
        }
        throw new Error("Invalid API configuration");
      }

      const request = {
        text: content,
        outputType: type,
        includeCitations: true,
        customization: {
          format: "structured",
          tone: "professional",
          length: "medium",
        },
      };

      const response = await fetch(`${API_URL}${ENDPOINTS.create}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
          "User-Agent": "SmartNotebook/1.0",
        },
        body: JSON.stringify(request),
      });

      const result = await handleApiResponse(response, "processContent");

      if (result.request_id) {
        // Poll for completion
        let status;
        do {
          status = await this.pollStatus(result.request_id);
          await new Promise((resolve) => setTimeout(resolve, 1000));
        } while (status.status === "processing");

        if (status.status === "failed") {
          throw new Error(status.error || "Content processing failed");
        }

        return {
          ...status,
          request_id: result.request_id,
        };
      }

      return result;
    } catch (error) {
      console.error("Content processing error:", error);
      return handleApiError(error, "processContent");
    }
  },

  async analyzeSource(sourceId: string): Promise<any> {
    try {
      const response = await fetch(`${API_URL}${ENDPOINTS.studio.analyze}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sourceId,
          type: "comprehensive",
          options: {
            includeSummary: true,
            includeTopics: true,
            includeKeywords: true,
            includeCitations: true,
          },
        }),
      });

      return handleApiResponse(response, "analyzeSource");
    } catch (error) {
      console.error("Source analysis error:", error);
      return handleApiError(error, "analyzeSource");
    }
  },

  /**
   * Perform sentiment analysis on an arbitrary block of text.
   * This mirrors the Studio analyze endpoint with a `sentiment` type.
   * The implementation is intentionally simple as tests mock out the
   * network layer.
   */
  async analyzeContentSentiment(content: string, options?: Record<string, any>) {
    try {
      const response = await fetch(`${API_URL}${ENDPOINTS.studio.analyze}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content, type: "sentiment", options }),
      });

      return handleApiResponse(response, "analyzeContentSentiment");
    } catch (error) {
      console.error("Sentiment analysis error:", error);
      return handleApiError(error, "analyzeContentSentiment");
    }
  },

  /**
   * Extract argumentative structures from text.
   */
  async extractArgumentation(content: string, options?: Record<string, any>) {
    try {
      const response = await fetch(`${API_URL}${ENDPOINTS.studio.analyze}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content, type: "argumentation", options }),
      });

      return handleApiResponse(response, "extractArgumentation");
    } catch (error) {
      console.error("Argumentation extraction error:", error);
      return handleApiError(error, "extractArgumentation");
    }
  },

  async createContent(request: ProcessRequest): Promise<ProcessResponse> {
    try {
      if (!validateApiConfig()) {
        if (OFFLINE_MODE) {
          return mockResponse(request);
        }
        throw new Error("API configuration is invalid");
      }

      const response = await fetch(`/api/content`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
          "User-Agent": "SmartNotebook/1.0",
        },
        body: JSON.stringify(request),
      });

      return handleApiResponse(response, "createContent");
    } catch (error) {
      return handleApiError(error, "createContent");
    }
  },

  async getContentStatus(id: string): Promise<ContentStatus> {
    try {
      if (!validateApiConfig()) {
        throw new Error("Invalid API configuration");
      }

      const response = await fetch(`${API_URL}${ENDPOINTS.status}/${id}`, {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
        },
      });

      return handleApiResponse(response, "getContentStatus");
    } catch (error) {
      return handleApiError(error, "getContentStatus");
    }
  },

  async getAvatars(): Promise<Avatar[]> {
    try {
      const response = await fetch('/api/getavatars');
      if (!response.ok) {
        throw new Error('Failed to fetch avatars');
      }
      return response.json();
    } catch (error) {
      console.error('Error fetching avatars:', error);
      throw error;
    }
  },
};
