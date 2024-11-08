export interface Story {
    _id: string;
    userId: string;
    title?: string;
    rawText: string;
    timelineJson: any;
    embedding: number[];
    createdAt: Date;
}

export interface SimilarStoryResult {
    _id: string;
    title: string;
    rawText: string;
    timelineJson: any;
    score: number;
} 