export const accountKeys = {
  all:    () => ["accounts"],
  lists:  () => ["accounts", "list"],
  list:   (f) => ["accounts", "list", f],
  detail: (id) => ["accounts", "detail", id],
  ea:     (id) => ["accounts", "ea", id],
  score:  (id) => ["accounts", "score", id],
};

export const tradeKeys = {
  all:      () => ["trades"],
  lists:    () => ["trades", "list"],
  list:     (f) => ["trades", "list", f],
  detail:   (id) => ["trades", "detail", id],
  stats:    (f) => ["trades", "stats", f],
  calendar: (m) => ["trades", "calendar", m],
};

export const transactionKeys = {
  all:          () => ["transactions"],
  lists:        () => ["transactions", "list"],
  list:         (f) => ["transactions", "list", f],
  summary:      (f) => ["transactions", "summary", f],
  distribution: (f) => ["transactions", "distribution", f],
  history:      (f) => ["transactions", "history", f],
  monthly:      (f) => ["transactions", "monthly", f],
};

export const notificationKeys = {
  all:         () => ["notifications"],
  list:        (f) => ["notifications", "list", f],
  unreadCount: () => ["notifications", "unread"],
  preferences: () => ["notifications", "preferences"],
};

export const scoreKeys = {
  account: (id)    => ["score", "account", id],
  user:    ()      => ["score", "user"],
  history: (id, w) => ["score", "history", id, w],
};

export const importKeys = {
  history: () => ["import", "history"],
  batch:   (id) => ["import", "batch", id],
  brokers: () => ["import", "brokers"],
  schemas: () => ["import", "custom-schemas"],
};

export const userKeys = {
  profile:     () => ["user", "profile"],
  preferences: () => ["user", "preferences"],
};
