# Graph Report - apps  (2026-07-14)

## Corpus Check
- 343 files · ~75,683 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1923 nodes · 4241 edges · 154 communities (83 shown, 71 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 24 edges (avg confidence: 0.71)
- Token cost: 167,977 input · 0 output

## Community Hubs (Navigation)
- Fund Entity Schema
- App Health Endpoint
- Cash Flow DTOs
- App Layout & Navigation
- Auth API Client
- NestJS CLI Config
- Import Preview Wizard UI
- Auth Layout & Icons
- Category Chart & Drawer
- Mail Service & Auth Config
- JWT Guard & Allocation DTOs
- Export/Import DTOs
- Change Password Flow
- Category Module & DTOs
- Categories Controller
- User Profile DTOs
- Fund Form Drawer
- Category Tabs & API
- Import/Export Controller
- API Security Dependencies
- Funds Controller
- Runway Card & Funds API
- Auth Controller Methods
- Create Fund DTO
- Health Assessment DTOs
- Excel Ledger Parser
- Web TS Config
- Button & Confirm Dialog
- Select & Fund Icons
- Net Worth & Allocation UI
- Transactions Page & Filters
- Categories Service
- API TS Config
- Health Card & Assessment API
- API NPM Scripts
- Web Vite Node Config
- Web Index HTML & Fonts
- Framework Tabs & Score Card
- User Entity & Google Login
- Health Profile Entity
- Auth Context Provider
- Transactions Controller
- Appearance & Data Export
- Auth Service Logic
- Web Lint Dev Dependencies
- App Router & Pages
- Transactions API Client
- API Jest Config
- API Runtime Dependencies
- App Providers & Theme
- Date Input Component
- Allocation Drawer Reducer
- Fund History DTOs
- Health Controller
- Modal & Password Change
- Adherence Chart
- Transaction Query DTO
- Fund Transactions List
- Funds Service
- Web UI Dependencies
- Fund Preset DTOs
- Monthly Allocation Entity
- Create Transaction DTO
- Transaction Validators
- Web NPM Scripts
- Currency & Validators
- API Build TS Config
- Recent Activity Widget
- API Lint Dev Dependencies
- Transaction Response Mapper
- Transactions Service
- Recommendation Cards
- Onboarding Flow Hook
- Health Empty State
- Update Category DTO
- Classification Targets DTO
- API Package Metadata
- Jest Module Extensions
- Migration: Create User
- Migration: Create Refresh Token
- Migration: Create Fund
- Migration: Create Category
- Migration: Create Transaction
- Migration: Create Transfer
- Migration: Create Health Profile
- Migration: User Profile Fields
- Migration: Framework Slot
- Migration: Drop Health Config
- Migration: Profit First Framework
- Migration: Fund Name Unique
- Migration: Monthly Allocation
- Migration: Password Reset
- Migration: Google Auth
- Migration: Scope Fund Unique
- Allocation Chip Component
- Test DB Migration Script
- Web App Branding
- Web TS Project References
- Dependency: cookie-parser
- Dependency: exceljs
- Dependency: google-auth-library
- Dependency: joi
- Dependency: @nestjs/common
- Dependency: @nestjs/core
- Dependency: @nestjs/jwt
- Dependency: @nestjs/passport
- Dependency: @nestjs/platform-express
- Dependency: @nestjs/throttler
- Dependency: rxjs
- Dependency: swagger-ui-express
- Dependency: typeorm
- Dependency: eslint-config-prettier
- Dependency: @eslint/eslintrc
- Dependency: @eslint/js
- Dependency: globals (API)
- Dependency: jest
- Dependency: @nestjs/cli
- Dependency: @nestjs/schematics
- Dependency: @nestjs/testing
- Dependency: prettier
- Dependency: source-map-support
- Dependency: supertest
- Dependency: ts-jest
- Dependency: ts-loader
- Dependency: ts-node
- Dependency: tsconfig-paths
- Dependency: @types/express
- Dependency: @types/jest
- Dependency: @types/multer
- Dependency: @types/node (API)
- Dependency: @types/passport-jwt
- Dependency: @types/supertest
- Dependency: typescript (API)
- Dependency: typescript-eslint
- Dependency: @testing-library/jest-dom
- Dependency: @testing-library/react
- Dependency: @testing-library/user-event
- Dependency: vite
- Dependency: @vitejs/plugin-react
- Dependency: vitest
- Dependency: @vitest/coverage-v8
- React Logo Asset
- Hero Illustration Asset
- Dependency: eslint (web)
- Dependency: globals (web)
- Dependency: @types/node (web)
- Vercel Rewrites Config
- Vite Logo Asset

## God Nodes (most connected - your core abstractions)
1. `apiFetch()` - 57 edges
2. `CurrentUser` - 48 edges
3. `formatMoney()` - 41 edges
4. `Fund` - 39 edges
5. `Category` - 35 edges
6. `User` - 35 edges
7. `Transaction` - 33 edges
8. `TransactionType` - 28 edges
9. `useAuth()` - 28 edges
10. `Fund` - 26 edges

## Surprising Connections (you probably didn't know these)
- `src/main.tsx` --configures--> `#root div`  [INFERRED]
  web/src/main.tsx → web/index.html
- `bootstrap()` --indirect_call--> `AppModule`  [INFERRED]
  api/src/main.ts → api/src/app.module.ts
- `ParsedTransactionRow` --references--> `TransactionType`  [EXTRACTED]
  api/src/modules/import-export/parsers/excel-ledger.parser.ts → api/src/common/enums/transaction-type.enum.ts
- `IssuedTokens` --references--> `AuthResponseDto`  [EXTRACTED]
  api/src/modules/auth/auth.service.ts → api/src/modules/auth/dto/auth-response.dto.ts
- `CategoryFormDrawerProps` --references--> `Category`  [EXTRACTED]
  web/src/features/categories/components/CategoryFormDrawer.tsx → web/src/features/categories/types.ts

## Import Cycles
- 4-file cycle: `web/src/features/funds/FundDetail.tsx -> web/src/features/transactions/TransactionFormModal.tsx -> web/src/features/funds/index.ts -> web/src/features/funds/FundDetailPage.tsx -> web/src/features/funds/FundDetail.tsx`
- 5-file cycle: `web/src/features/funds/FundDetail.tsx -> web/src/features/transactions/index.ts -> web/src/features/transactions/TransactionsPage.tsx -> web/src/features/funds/index.ts -> web/src/features/funds/FundDetailPage.tsx -> web/src/features/funds/FundDetail.tsx`

## Communities (154 total, 71 thin omitted)

### Community 0 - "Fund Entity Schema"
Cohesion: 0.05
Nodes (51): Fund, Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn (+43 more)

### Community 1 - "App Health Endpoint"
Cohesion: 0.06
Nodes (38): AppController, Controller, Get, HttpCode, AppModule, Module, HttpExceptionFilter, envValidationSchema (+30 more)

### Community 2 - "Cash Flow DTOs"
Cohesion: 0.07
Nodes (33): CashFlowPointDto, CashFlowQueryDto, IsInt, IsOptional, Max, Min, Type, CategoryBreakdownPointDto (+25 more)

### Community 3 - "App Layout & Navigation"
Cohesion: 0.06
Nodes (46): AppLayout(), ACTION_ITEMS, CommandPalette(), GROUP_ORDER, NAV_ITEMS, PaletteGroup, PaletteItem, QUICK_ACTION_ICONS (+38 more)

### Community 4 - "Auth API Client"
Cohesion: 0.08
Nodes (44): forgotPassword(), getMe(), googleAuth(), login(), logout(), register(), resetPassword(), AuthResponse (+36 more)

### Community 5 - "NestJS CLI Config"
Cohesion: 0.05
Nodes (42): collection, compilerOptions, assets, deleteOutDir, plugins, watchAssets, $schema, sourceRoot (+34 more)

### Community 6 - "Import Preview Wizard UI"
Cohesion: 0.08
Nodes (38): importCommit(), importPreview(), PreviewStep(), Props, Props, StepIndicator(), STEPS, Props (+30 more)

### Community 7 - "Auth Layout & Icons"
Cohesion: 0.10
Nodes (30): WealetIcon(), WealetIconProps, AuthCenteredLayout(), AuthCenteredLayoutProps, EmailField, EmailFieldProps, FieldError(), AlertCircleIcon() (+22 more)

### Community 8 - "Category Chart & Drawer"
Cohesion: 0.12
Nodes (26): CategoryChart(), PALETTE, Props, CategoryChartDrawer(), CategoryChartDrawerProps, PALETTE, MonthSelector(), CustomTooltip() (+18 more)

### Community 9 - "Mail Service & Auth Config"
Cohesion: 0.09
Nodes (19): MailService, Injectable, AuthConfig, IssuedTokens, InjectRepository, UserResponseDto, RefreshToken, Column (+11 more)

### Community 10 - "JWT Guard & Allocation DTOs"
Cohesion: 0.09
Nodes (24): JwtAuthGuard, Injectable, AllocationDistributionDto, AllocationResponseDto, CreateAllocationDto, DistributionItemDto, IsUUID, Matches (+16 more)

### Community 11 - "Export/Import DTOs"
Cohesion: 0.11
Nodes (20): ExportQueryDto, IsDateString, IsOptional, ImportCommitDto, Type, ValidateNested, ImportCommitResultDto, ImportPreviewResponseDto (+12 more)

### Community 12 - "Change Password Flow"
Cohesion: 0.07
Nodes (25): ChangePasswordDto, IsOptional, IsString, Matches, MaxLength, MinLength, ForgotPasswordDto, IsEmail (+17 more)

### Community 13 - "Category Module & DTOs"
Cohesion: 0.15
Nodes (16): TransactionType, assignDefined(), Transaction, Column, CreateDateColumn, Entity, Index, JoinColumn (+8 more)

### Community 14 - "Categories Controller"
Cohesion: 0.11
Nodes (21): CategoriesController, ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags, Body, Controller, Delete (+13 more)

### Community 15 - "User Profile DTOs"
Cohesion: 0.12
Nodes (20): IsBoolean, IsIn, IsOptional, IsString, MaxLength, UpdateUserDto, UserProfileDto, UserTheme (+12 more)

### Community 16 - "Fund Form Drawer"
Cohesion: 0.15
Nodes (20): createFund(), FundFormDrawer(), FundFormDrawerProps, PRESET_COLORS, FundHeaderCard(), FundHeaderCardProps, FundStatsColumn(), FundStatsColumnProps (+12 more)

### Community 17 - "Category Tabs & API"
Cohesion: 0.17
Nodes (20): SegmentedTabOption, SegmentedTabs(), SegmentedTabsProps, createCategory(), deleteCategory(), listCategories(), updateCategory(), CategoriesPage() (+12 more)

### Community 18 - "Import/Export Controller"
Cohesion: 0.09
Nodes (21): ImportPreviewDto, IsInt, IsOptional, Max, Min, Type, ImportExportController, ApiBearerAuth (+13 more)

### Community 19 - "API Security Dependencies"
Cohesion: 0.08
Nodes (25): dependencies, argon2, class-transformer, class-validator, dotenv, helmet, @nestjs/config, @nestjs/swagger (+17 more)

### Community 20 - "Funds Controller"
Cohesion: 0.20
Nodes (17): CurrentUser, FundResponseDto, FundsController, ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags, Body (+9 more)

### Community 21 - "Runway Card & Funds API"
Cohesion: 0.19
Nodes (18): RunwayCard(), RunwayFundsDrawer(), RunwayFundsDrawerProps, useRunway(), deleteFund(), getFundHistory(), listFunds(), updateFund() (+10 more)

### Community 22 - "Auth Controller Methods"
Cohesion: 0.24
Nodes (13): AuthController, ApiBearerAuth, ApiOperation, ApiTags, Body, Controller, HttpCode, Post (+5 more)

### Community 23 - "Create Fund DTO"
Cohesion: 0.09
Nodes (21): CreateFundDto, IsBoolean, IsEnum, IsInt, IsOptional, IsString, Max, MaxLength (+13 more)

### Community 24 - "Health Assessment DTOs"
Cohesion: 0.16
Nodes (14): AssessmentQueryDto, IsDateString, IsOptional, AssessmentResponseDto, FundAssessmentDto, IsEnum, IsNumberString, IsOptional (+6 more)

### Community 25 - "Excel Ledger Parser"
Cohesion: 0.14
Nodes (22): computeDedupeHash(), daysInMonth(), describeCellValue(), findTotalsPerFundRowIndex(), getCell(), getCommentText(), getNumericValue(), getSheetRange() (+14 more)

### Community 26 - "Web TS Config"
Cohesion: 0.08
Nodes (23): DOM, src, vite/client, vitest/globals, compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, jsx (+15 more)

### Community 27 - "Button & Confirm Dialog"
Cohesion: 0.17
Nodes (17): Button(), ButtonProps, HEIGHTS, ConfirmDialog(), ConfirmDialogProps, TrashIcon(), FundDetailProps, PRESET_NAMES (+9 more)

### Community 28 - "Select & Fund Icons"
Cohesion: 0.13
Nodes (19): CloseIcon(), PlusIcon(), Select, SelectOption, SelectProps, CreateFundPayload, FundClassification, AddFundForm() (+11 more)

### Community 29 - "Net Worth & Allocation UI"
Cohesion: 0.15
Nodes (16): PatrimonioCard(), Props, SEGMENTS, useNetWorth(), AllocationDistributionStep(), Props, AllocationIncomeStep(), Props (+8 more)

### Community 30 - "Transactions Page & Filters"
Cohesion: 0.18
Nodes (16): MONTH_NAMES, useFundsAll(), useActivity(), TransactionsPage(), TABS, TabValue, TransactionsTabs(), TransactionsTabsProps (+8 more)

### Community 31 - "Categories Service"
Cohesion: 0.13
Nodes (14): CategoriesService, Injectable, InjectRepository, Category, Column, CreateDateColumn, Entity, JoinColumn (+6 more)

### Community 32 - "API TS Config"
Cohesion: 0.09
Nodes (21): compilerOptions, allowSyntheticDefaultImports, declaration, emitDecoratorMetadata, esModuleInterop, experimentalDecorators, forceConsistentCasingInFileNames, incremental (+13 more)

### Community 33 - "Health Card & Assessment API"
Cohesion: 0.17
Nodes (19): HealthCard(), Props, statusTag(), createAllocation(), getHealthAssessment(), getHealthProfile(), updateHealthProfile(), updateMonthlyIncome() (+11 more)

### Community 34 - "API NPM Scripts"
Cohesion: 0.10
Nodes (21): scripts, build, dev, format, lint, migration:generate, migration:revert, migration:run (+13 more)

### Community 35 - "Web Vite Node Config"
Cohesion: 0.10
Nodes (20): node, vite.config.ts, compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection (+12 more)

### Community 36 - "Web Index HTML & Fonts"
Cohesion: 0.10
Nodes (20): favicon.svg, Google Fonts (Geist), src/main.tsx, #root div, Wealet (app title), Web README, ESLint configuration (eslint.config.js), eslint-plugin-react-dom (+12 more)

### Community 37 - "Framework Tabs & Score Card"
Cohesion: 0.19
Nodes (15): FrameworkTabs(), Props, fmtIncome, Props, ScoreCard(), HealthFramework, ALL_FRAMEWORKS, FRAMEWORK_ACTIVATE_WARNING (+7 more)

### Community 38 - "User Entity & Google Login"
Cohesion: 0.15
Nodes (9): Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn, User, Injectable, InjectRepository (+1 more)

### Community 39 - "Health Profile Entity"
Cohesion: 0.15
Nodes (12): HealthProfile, Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn, frameworkSlotPrefix() (+4 more)

### Community 40 - "Auth Context Provider"
Cohesion: 0.26
Nodes (11): AuthProvider(), AuthContext, AuthContextValue, AuthStatus, LoginPayload, RegisterPayload, User, ApiFetchOptions (+3 more)

### Community 41 - "Transactions Controller"
Cohesion: 0.16
Nodes (13): TransactionsController, ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags, Body, Controller, Delete (+5 more)

### Community 42 - "Appearance & Data Export"
Cohesion: 0.18
Nodes (10): useTheme(), exportAll(), AppearanceCard(), THEME_OPTIONS, actionBtnStyle, DataAccountGrid(), SecurityCard(), SettingsPage() (+2 more)

### Community 44 - "Web Lint Dev Dependencies"
Cohesion: 0.12
Nodes (17): eslint-plugin-react-hooks, eslint-plugin-react-refresh, jsdom, @types/react, @types/react-dom, devDependencies, @eslint/js, eslint-plugin-react-hooks (+9 more)

### Community 45 - "App Router & Pages"
Cohesion: 0.25
Nodes (10): ImportPage, AuthPage(), AuthPageProps, ProtectedRoute(), ResetPasswordPage(), useAuth(), getUserInitials(), DashboardPage() (+2 more)

### Community 46 - "Transactions API Client"
Cohesion: 0.18
Nodes (15): createTransaction(), deleteTransaction(), listActivity(), listTransactions(), toQueryString(), updateTransaction(), ActivityQuery, ActivitySubtype (+7 more)

### Community 47 - "API Jest Config"
Cohesion: 0.12
Nodes (15): author, description, jest, collectCoverageFrom, coverageDirectory, rootDir, testEnvironment, testRegex (+7 more)

### Community 48 - "API Runtime Dependencies"
Cohesion: 0.12
Nodes (16): argon2, @scarf/scarf, unrs-resolver, pnpm-workspace.yaml (allowBuilds), API README, NestJS, NestJS Devtools, NestJS Mau (deployment platform) (+8 more)

### Community 49 - "App Providers & Theme"
Cohesion: 0.22
Nodes (9): AppProviders(), queryClient, AppRouter(), Theme, ThemeContext, ThemeContextValue, getInitialTheme(), ThemeProvider() (+1 more)

### Community 50 - "Date Input Component"
Cohesion: 0.17
Nodes (8): DateInput, DateInputProps, MONTHS_ES, WEEKDAYS, computeFloatingPosition(), FloatingPosition, FloatingRect, TransactionsToolbar()

### Community 51 - "Allocation Drawer Reducer"
Cohesion: 0.28
Nodes (12): buildInitialState(), computeProposed(), DrawerAction, drawerReducer(), DrawerState, DrawerStep, getFrameworkFunds(), AllocationDrawer() (+4 more)

### Community 52 - "Fund History DTOs"
Cohesion: 0.16
Nodes (10): FundHistoryQueryDto, IsInt, IsOptional, Max, Min, Type, FundQueryDto, IsBoolean (+2 more)

### Community 53 - "Health Controller"
Cohesion: 0.18
Nodes (11): HealthController, ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags, Body, Controller, Get (+3 more)

### Community 54 - "Modal & Password Change"
Cohesion: 0.25
Nodes (10): Modal(), ModalProps, changePassword(), updateProfile(), ChangePasswordModal(), Props, useChangePassword(), useUpdateProfile() (+2 more)

### Community 55 - "Adherence Chart"
Cohesion: 0.20
Nodes (10): AdherenceChart(), CLS_COLOR, Props, statusTag(), AllocationDistribution, AllocationResponse, AssessmentResponse, FundAssessment (+2 more)

### Community 56 - "Transaction Query DTO"
Cohesion: 0.15
Nodes (12): TransactionQueryDto, IsDateString, IsEnum, IsInt, IsOptional, IsString, IsUUID, MaxLength (+4 more)

### Community 57 - "Fund Transactions List"
Cohesion: 0.22
Nodes (11): Category, FundTransactionsList(), FundTransactionsListProps, TransactionFormModalProps, formatDate(), MONTH_ABBR, TableRow, TransactionsTable() (+3 more)

### Community 58 - "Funds Service"
Cohesion: 0.26
Nodes (4): FundsService, Injectable, InjectDataSource, InjectRepository

### Community 59 - "Web UI Dependencies"
Cohesion: 0.15
Nodes (13): react, react-dom, @react-oauth/google, react-router-dom, recharts, @tanstack/react-query, dependencies, react (+5 more)

### Community 60 - "Fund Preset DTOs"
Cohesion: 0.29
Nodes (6): CreatePresetFundsDto, IsEnum, FundHistoryPointDto, FundPresetType, FundBalanceRow, PRESET_TO_FRAMEWORK

### Community 61 - "Monthly Allocation Entity"
Cohesion: 0.17
Nodes (11): MonthlyAllocation, Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn (+3 more)

### Community 62 - "Create Transaction DTO"
Cohesion: 0.22
Nodes (9): CreateTransactionDto, IsDateString, IsEnum, IsIn, IsOptional, IsString, IsUUID, Matches (+1 more)

### Community 63 - "Transaction Validators"
Cohesion: 0.22
Nodes (9): IsDateString, IsEnum, IsIn, IsOptional, IsString, IsUUID, Matches, MaxLength (+1 more)

### Community 64 - "Web NPM Scripts"
Cohesion: 0.22
Nodes (9): scripts, build, dev, lint, preview, test, test:coverage, test:watch (+1 more)

### Community 65 - "Currency & Validators"
Cohesion: 0.54
Nodes (3): CURRENCY_EXPONENTS, SUPPORTED_CURRENCIES, IsNotFutureDate()

### Community 66 - "API Build TS Config"
Cohesion: 0.25
Nodes (7): exclude, extends, dist, node_modules, **/*spec.ts, test, ./tsconfig.json

### Community 67 - "Recent Activity Widget"
Cohesion: 0.46
Nodes (7): itemAmountColor(), itemAmountPrefix(), itemIcon(), itemLabel(), itemMeta(), RecentActivity(), useRecentActivity()

### Community 68 - "API Lint Dev Dependencies"
Cohesion: 0.29
Nodes (7): devDependencies, eslint, eslint-plugin-prettier, @types/cookie-parser, eslint, eslint-plugin-prettier, @types/cookie-parser

### Community 69 - "Transaction Response Mapper"
Cohesion: 0.57
Nodes (4): PaginatedTransactionsResponseDto, TransactionResponseDto, TransactionSource, toTransactionResponseDto()

### Community 72 - "Onboarding Flow Hook"
Cohesion: 0.53
Nodes (5): getAllocationCurrent(), useAllocation(), useCompleteOnboarding(), SLOT_PRESETS, useOnboardingFlow()

### Community 73 - "Health Empty State"
Cohesion: 0.33
Nodes (5): Action, CONTENT, HealthEmptyState(), Props, Variant

### Community 74 - "Update Category DTO"
Cohesion: 0.40
Nodes (5): IsEnum, IsOptional, IsString, MaxLength, UpdateCategoryDto

### Community 75 - "Classification Targets DTO"
Cohesion: 0.40
Nodes (4): ClassificationTargetsDto, IsInt, Max, Min

### Community 76 - "API Package Metadata"
Cohesion: 0.40
Nodes (4): name, private, type, version

### Community 77 - "Jest Module Extensions"
Cohesion: 0.50
Nodes (4): moduleFileExtensions, js, json, ts

### Community 94 - "Allocation Chip Component"
Cohesion: 0.67
Nodes (3): AllocationChip(), currentMonthName(), Props

### Community 96 - "Web App Branding"
Cohesion: 0.67
Nodes (3): Wealet Web App, Wealet App Icon (favicon.svg), Stylized 'W' Mark with Bar Chart

## Knowledge Gaps
- **368 isolated node(s):** `$schema`, `collection`, `sourceRoot`, `deleteOutDir`, `common/mail/email-templates/**/*.html` (+363 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **71 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `AuthProvider()` connect `Auth Context Provider` to `App Providers & Theme`, `App Router & Pages`, `User Profile DTOs`?**
  _High betweenness centrality (0.319) - this node is a cross-community bridge._
- **Why does `CurrentUser` connect `Funds Controller` to `Fund Entity Schema`, `Cash Flow DTOs`, `NestJS CLI Config`, `Transaction Response Mapper`, `Mail Service & Auth Config`, `JWT Guard & Allocation DTOs`, `Export/Import DTOs`, `Change Password Flow`, `Transactions Controller`, `Categories Controller`, `User Profile DTOs`, `Import/Export Controller`, `Fund History DTOs`, `Health Controller`, `Auth Controller Methods`, `Health Assessment DTOs`, `Transaction Query DTO`?**
  _High betweenness centrality (0.301) - this node is a cross-community bridge._
- **Why does `refreshSession()` connect `Auth Context Provider` to `Auth API Client`?**
  _High betweenness centrality (0.054) - this node is a cross-community bridge._
- **What connects `$schema`, `collection`, `sourceRoot` to the rest of the system?**
  _368 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Fund Entity Schema` be split into smaller, more focused modules?**
  _Cohesion score 0.05128205128205128 - nodes in this community are weakly interconnected._
- **Should `App Health Endpoint` be split into smaller, more focused modules?**
  _Cohesion score 0.05576923076923077 - nodes in this community are weakly interconnected._
- **Should `Cash Flow DTOs` be split into smaller, more focused modules?**
  _Cohesion score 0.06746031746031746 - nodes in this community are weakly interconnected._