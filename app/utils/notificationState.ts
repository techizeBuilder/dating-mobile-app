let activeChatPartnerUserId: string | null = null;

export function setActiveChatPartner(userId: string | null) {
  activeChatPartnerUserId = userId;
}

export function getActiveChatPartner(): string | null {
  return activeChatPartnerUserId;
}


