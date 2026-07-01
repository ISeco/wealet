# Data Model

All entities have: `id` (uuid pk), `createdAt`, `updatedAt`.
All user-owned entities have: `userId` (uuid fk → User, indexed).

---

```
User
  id                      uuid pk
  email                   citext unique not null
  passwordHash            text not null
  displayName             text
  theme                   enum(light | dark | system) default 'system'
  onboardingCompleted     bool default false
  onboardingCompletedAt   timestamptz null
  createdAt, updatedAt

RefreshToken
  id              uuid pk
  userId          uuid fk → User
  tokenHash       text not null     ← never store plain token
  expiresAt       timestamptz
  revokedAt       timestamptz null
  createdAt

Fund                               ← spine of the domain (envelope system)
  id                uuid pk
  userId            uuid fk idx
  name              text not null
  classification    enum(available | reserve | committed) not null
  color             text
  isOperative       bool default false    ← the daily spending fund
  countsForRunway   bool default false    ← counts toward financial runway
  frameworkSlot     text null             ← named slot in the active health framework (e.g. "50_30_20:necesidades")
  targetPercentage  integer null          ← target allocation % for health assessment
  archivedAt        timestamptz null
  UNIQUE(userId, name)

Category                           ← analysis dimension (not the spine)
  id              uuid pk
  userId          uuid fk nullable  ← null = system category
  name            text not null
  type            enum(income | expense) not null
  color           text
  isSystem        bool default false
  UNIQUE(userId, name, type)

Transaction                        ← hits exactly one Fund
  id              uuid pk
  userId          uuid fk idx
  fundId          uuid fk idx
  categoryId      uuid fk
  type            enum(income | expense) not null
  amount          bigint not null ≥ 0
  currency        char(3) default 'CLP'
  description     text
  occurredOn      date not null idx
  dedupeHash      text
  source          enum(manual | import) default 'manual'
  createdAt, updatedAt
  INDEX(userId, occurredOn)
  INDEX(userId, fundId, occurredOn)
  UNIQUE(userId, dedupeHash) WHERE source = 'import'

Transfer                           ← reallocation between Funds, net worth unchanged
  id              uuid pk
  userId          uuid fk idx
  fromFundId      uuid fk
  toFundId        uuid fk
  amount          bigint not null > 0
  currency        char(3) default 'CLP'
  occurredOn      date not null
  note            text
  createdAt
  CHECK(fromFundId <> toFundId)

HealthProfile
  id              uuid pk
  userId          uuid fk unique
  framework       enum(50_30_20 | jars_eker | profit_first | fondos) default 'fondos'
  monthlyIncome   bigint null
  updatedAt
```

---

## Key design notes

- **Fund balance is derived**: `Σ(income transactions) − Σ(expense transactions) + Σ(incoming transfers) − Σ(outgoing transfers)`. Single source of truth; cannot desync.
- **Transfer is atomic**: debit + credit in one DB transaction. See architecture rule in `@CLAUDE.md`.
- **Net worth segments** come from aggregating `Fund.classification`: available / reserve / committed.
- **Runway** = `Σ(funds where countsForRunway = true)` ÷ average monthly burn.
- **`citext`** for email: case-insensitive without `lower()` on every query.
- **`dedupeHash`** partial unique index: import idempotency enforced at DB level, not just application.
- **`amount` as non-negative bigint + separate `type`** (instead of signed amount): cleaner reports and simpler validation.
- **Health framework targets live on `Fund`**: `frameworkSlot` + `targetPercentage` replace a `config` jsonb blob. Seeded automatically when the user selects a framework in health profile. `fondos` framework measures net current balances (no slot needed); 50/30/20 and Jars use slot-tagged funds and measure period income flow.
- **Jars of Eker** = seeds 6 `Fund` rows with `frameworkSlot` tags and preset `targetPercentage` values. No separate schema needed.
