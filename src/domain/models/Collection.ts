export interface Collection {
  id: string;
  name: string;
  createdAt: number;
}

export interface CollectionBook {
  collectionId: string;
  bookId: string;
}
