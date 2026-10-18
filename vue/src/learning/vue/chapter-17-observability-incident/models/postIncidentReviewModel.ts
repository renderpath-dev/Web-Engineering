export interface PostIncidentActionItem {
  readonly id: string;
  readonly owner: string;
  readonly evidence: string;
  readonly dueInDays: number;
}

export interface PostIncidentReview {
  readonly incidentId: string;
  readonly timelineComplete: boolean;
  readonly actionItems: ReadonlyArray<PostIncidentActionItem>;
  readonly blameless: boolean;
}

export function isPostIncidentReviewComplete(review: PostIncidentReview): boolean {
  return (
    review.timelineComplete &&
    review.blameless &&
    review.actionItems.length > 0 &&
    review.actionItems.every((item) => item.owner.length > 0 && item.evidence.length > 0)
  );
}
