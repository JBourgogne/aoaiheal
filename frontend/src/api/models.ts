export type AskResponse = {
    answer: string;
    citations: Citation[];
    error?: string;
    message_id?: string;
    feedback?: Feedback;
};

export type Citation = {
    part_index?: number;
    content: string;
    id: string;
    title: string | null;
    filepath: string | null;
    url: string | null;
    metadata: string | null;
    chunk_id: string | null;
    reindex_id: string | null;
}

export type ToolMessageContent = {
    citations: Citation[];
    intent: string;
}

export type ChatMessage = {
    id: string;
    role: string;
    content: string;
    end_turn?: boolean;
    date: string;
    feedback?: Feedback;
    context?: string;
};

export type Conversation = {
    id: string;
    title: string;
    messages: ChatMessage[];
    date: string;
}

export enum ChatCompletionType {
    ChatCompletion = "chat.completion",
    ChatCompletionChunk = "chat.completion.chunk"
}

export type ChatResponseChoice = {
    messages: ChatMessage[];
}

export type ChatResponse = {
    id: string;
    model: string;
    created: number;
    object: ChatCompletionType;
    choices: ChatResponseChoice[];
    history_metadata: {
        conversation_id: string;
        title: string;
        date: string;
    }
    error?: any;
}

export type ConversationRequest = {
    messages: ChatMessage[];
};

export type UserInfo = {
    access_token: string;
    expires_on: string;
    id_token: string;
    provider_name: string;
    user_claims: any[];
    user_id: string;
};

export enum CosmosDBStatus {
    NotConfigured = "CosmosDB is not configured",
    NotWorking = "CosmosDB is not working",
    InvalidCredentials = "CosmosDB has invalid credentials",
    InvalidDatabase = "Invalid CosmosDB database name",
    InvalidContainer = "Invalid CosmosDB container name",
    Working = "CosmosDB is configured and working",
}

export type CosmosDBHealth = {
    cosmosDB: boolean,
    status: string
}

export enum ChatHistoryLoadingState {
    Loading = "loading",
    Success = "success",
    Fail = "fail",
    NotStarted = "notStarted"
}

export type ErrorMessage = {
    title: string,
    subtitle: string
}

export type UI = {
    title: string;
    chat_title: string;
    chat_description: string;
    logo?: string;
    chat_logo?: string;
    show_share_button?: boolean
}

export type FrontendSettings = {
    auth_enabled?: string | null;
    feedback_enabled?: string | null;
    ui?: UI;
}

export enum Feedback {
    Neutral = "neutral",
    Positive = "positive",
    Negative = "negative",
    MissingCitation = "missing_citation",
    WrongCitation = "wrong_citation",
    OutOfScope = "out_of_scope",
    InaccurateOrIrrelevant = "inaccurate_or_irrelevant",
    OtherUnhelpful = "other_unhelpful",
    HateSpeech = "hate_speech",
    Violent = "violent",
    Sexual = "sexual",
    Manipulative = "manipulative",
    OtherHarmful = "other_harmlful"
}

export interface Answer {
    questionId: string;
    questionText: string;
    answerType: 'single choice' | 'multi-choice' | 'text';
    options?: string[]; // Present for single choice and multi-choice questions
    answer: string | string[]; // Could be an array for multi-choice answers
  }
  
  export interface UserDetails {
    userId: string;
    email: string;
    firstName: string;
    lastName: string;
    fullName: string;
    userPhone: string;
    userEmail: string;
    sex: 'Male' | 'Female' | 'Other'; // Assuming this is a single choice question
    healthConditions?: string[]; // Assuming this is a multi-choice question
    medicalHistory: string; // Assuming this is a free text response
    medications: string; // Assuming this is a free text response
    allergies: string; // Assuming this is a free text response
    dietaryPreferences?: string[]; // Assuming this is a multi-choice question
    physicalActivityLevel: 'Sedentary' | 'Lightly active' | 'Moderately active' | 'Very active' | 'Extra active'; // Assuming this is a single choice question
    sleepPatterns: 'Consistent' | 'Inconsistent' | 'Insomnia' | 'Hypersomnia' | 'Other'; // Assuming this is a single choice question
    tobaccoAlcoholDrugUse?: string[]; // Assuming this is a multi-choice question
    healthInsuranceProvider: string; // Assuming this is a free text response
    primaryCarePhysicianDetails: {
      name: string;
      email: string;
      address: string;
      provider: string;
    };
    emergencyContactInformation: {
      name: string;
      phone: string;
      relationship: string;
    };
    healthGoals: string; // Assuming this is a free text response
    // Include any additional fields as necessary
    answers: Answer[]; // This could be used if you prefer to store all answers in a structured array
  }
export interface Answer {
  questionId: string;
  questionText: string;
  answerType: 'single choice' | 'multi-choice' | 'text';
  options?: string[]; // Present for single choice and multi-choice questions
  answer: string | string[]; // Could be an array for multi-choice answers
}

export interface UserDetails {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  userPhone: string;
  userEmail: string;
  sex: 'Male' | 'Female' | 'Other'; // Assuming this is a single choice question
  healthConditions?: string[]; // Assuming this is a multi-choice question
  medicalHistory: string; // Assuming this is a free text response
  medications: string; // Assuming this is a free text response
  allergies: string; // Assuming this is a free text response
  dietaryPreferences?: string[]; // Assuming this is a multi-choice question
  physicalActivityLevel: 'Sedentary' | 'Lightly active' | 'Moderately active' | 'Very active' | 'Extra active'; // Assuming this is a single choice question
  sleepPatterns: 'Consistent' | 'Inconsistent' | 'Insomnia' | 'Hypersomnia' | 'Other'; // Assuming this is a single choice question
  tobaccoAlcoholDrugUse?: string[]; // Assuming this is a multi-choice question
  healthInsuranceProvider: string; // Assuming this is a free text response
  primaryCarePhysicianDetails: {
    name: string;
    email: string;
    address: string;
    provider: string;
  };
  emergencyContactInformation: {
    name: string;
    phone: string;
    relationship: string;
  };
  healthGoals: string; // Assuming this is a free text response
  // Include any additional fields as necessary
  answers: Answer[]; // This could be used if you prefer to store all answers in a structured array
}
  