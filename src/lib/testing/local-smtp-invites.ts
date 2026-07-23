/** Caixa SMTP e fluxo de convite exclusivamente em memória para testes locais. */
type InviteStatus = "pending" | "accepted" | "cancelled";
type Invite = { id: string; accountId: string; organization: string; email: string; role: string; token: string; expiresAt: number; status: InviteStatus };
type Mail = { to: string; subject: string; html: string };

export class LocalMailbox {
  readonly messages: Mail[] = [];
  failNextDelivery = false;

  send(message: Mail) {
    if (this.failNextDelivery) {
      this.failNextDelivery = false;
      throw new Error("Falha SMTP local simulada.");
    }
    this.messages.push(message);
  }
}

export class LocalInviteEnvironment {
  readonly mailbox = new LocalMailbox();
  private readonly invites = new Map<string, Invite>();
  private readonly members = new Map<string, { accountId: string; email: string; role: string }>();
  private now = 1_700_000_000_000;
  private sequence = 0;

  advance(milliseconds: number) { this.now += milliseconds; }

  invite(accountId: string, organization: string, sender: string, email: string, role: string) {
    const normalized = email.toLowerCase();
    const old = [...this.invites.values()].find((i) => i.accountId === accountId && i.email === normalized && i.status === "pending");
    if (old) old.status = "cancelled";
    const id = `local-invite-${++this.sequence}`;
    const token = `local-token-${id}-${this.now}`;
    const invite: Invite = { id, accountId, organization, email: normalized, role, token, expiresAt: this.now + 3_600_000, status: "pending" };
    this.invites.set(id, invite);
    try {
      this.mailbox.send({ to: normalized, subject: `Convite para ${organization}`, html: `${sender} convidou você para ${organization}. Aceite: https://local.test/invite/${token}` });
    } catch (error) {
      this.invites.delete(id);
      throw error;
    }
    return { ...invite };
  }

  resend(accountId: string, inviteId: string, sender: string) {
    const invite = this.requireOwnerInvite(accountId, inviteId);
    invite.status = "cancelled";
    return this.invite(accountId, invite.organization, sender, invite.email, invite.role);
  }

  cancel(accountId: string, inviteId: string) { this.requireOwnerInvite(accountId, inviteId).status = "cancelled"; }

  accept(accountId: string, email: string, token: string) {
    const invite = [...this.invites.values()].find((i) => i.token === token);
    if (!invite || invite.accountId !== accountId) throw new Error("Convite não pertence à organização.");
    if (invite.email !== email.toLowerCase()) throw new Error("Convite não pertence a este usuário.");
    if (invite.status !== "pending") throw new Error("Convite já utilizado ou cancelado.");
    if (invite.expiresAt <= this.now) throw new Error("Convite expirado.");
    const key = `${accountId}:${invite.email}`;
    if (!this.members.has(key)) this.members.set(key, { accountId, email: invite.email, role: invite.role });
    invite.status = "accepted";
    return { ...this.members.get(key)! };
  }

  memberCount(accountId: string, email: string) { return this.members.has(`${accountId}:${email.toLowerCase()}`) ? 1 : 0; }

  private requireOwnerInvite(accountId: string, inviteId: string) {
    const invite = this.invites.get(inviteId);
    if (!invite || invite.accountId !== accountId) throw new Error("Convite não encontrado nesta organização.");
    if (invite.status !== "pending") throw new Error("Convite não está pendente.");
    return invite;
  }
}
