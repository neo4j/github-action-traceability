class ShortLink {
  id: string;

  constructor(id: string) {
    this.id = id;
  }
}

class NoIdShortLink extends ShortLink {
  constructor(id: string) {
    super(id);
  }
}

class LinearIssueLink extends ShortLink {
  constructor(id: string) {
    super(id);
  }
}

export { ShortLink, NoIdShortLink, LinearIssueLink };
