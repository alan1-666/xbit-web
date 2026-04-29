# XBit Web App Coding Conventions

## Tech Stack
- Vite
- React
- Redux + Redux Toolkit + Redux Persist
- TypeScript
- HTML/CSS/JavaScript
- GraphQL with Apollo Client
- MQTT
- Lodash
- Day.js
- React Query
- ESLint
- Prettier
- Tailwind CSS

## Table of Contents
1. [Project Structure](#project-structure)
2. [Naming Conventions](#naming-conventions)
3. [TypeScript Conventions](#typescript-conventions)
4. [React Development](#react-development)
   - [Component Structure](#component-structure)
   - [Component Organization](#component-organization)
     - [Import Order Conventions](#import-order-conventions)
   - [Hooks Guidelines](#hooks-guidelines)
   - [State Management](#state-management)
5. [Styling Guidelines](#styling-guidelines)
   - [Tailwind CSS Conventions](#tailwind-css-conventions)
   - [Responsive Design](#responsive-design)
   - [Component Styling](#component-styling)
   - [Animation](#animation)
6. [Data Management](#data-management)
   - [Redux Toolkit Conventions](#redux-toolkit-conventions)
   - [GraphQL Conventions](#graphql-conventions)
   - [React Query Conventions](#react-query-conventions)
   - [MQTT Conventions](#mqtt-conventions)
7. [Code Quality](#code-quality)
   - [ESLint and Prettier Rules](#eslint-and-prettier-rules)
   - [Error Handling Conventions](#error-handling-conventions)
   - [Code Commenting Conventions](#code-commenting-conventions)
   - [Testing Conventions](#testing-conventions)
8. [Best Practices](#best-practices)
   - [RORO Pattern](#function-composition-and-roro-pattern)
   - [Conditional and Null Handling](#conditional-and-null-handling)
   - [Code Organization and Readability](#code-organization-and-readability)
   - [Performance Optimization Conventions](#performance-optimization-conventions)
9. [Accessibility and Internationalization](#accessibility-and-internationalization)
10. [Return Data Model Conventions](#return-data-model-conventions)
11. [Git Workflow](#git-workflow)
    - [Commit Message Format](#commit-message-format)
12. [Additional Resources](#additional-resources)

## Project Structure

```bash
src/
├── assets/           # Static assets (images, fonts, etc.)
├── components/       # Reusable components
│   ├── common/      # Shared components
│   ├── features/    # Feature-specific components
│   └── layouts/     # Layout components
├── config/          # Configuration files
├── graphql/         # GraphQL queries and mutations
│   ├── queries/
│   └── mutations/
├── hooks/           # Custom React hooks
├── lib/             # Third-party library configurations
├── pages/           # Page components
├── services/        # API and external service integrations
├── store/           # Redux store configuration
│   ├── slices/      # Redux slices
│   └── middleware/  # Custom middleware
├── styles/          # Global styles and theme
├── types/           # TypeScript type definitions
└── utils/           # Helper functions and constants
```

## Naming Conventions

- Use PascalCase for:
  - Component names
  - Type/Interface names
  - Enum names
- Use camelCase for:
  - Variables
  - Functions
  - Methods
  - Props
- Use UPPER_SNAKE_CASE for:
  - Constants
  - Environment variables
- Use kebab-case for:
  - File names
  - CSS class names
  - URLs

## TypeScript Conventions

```typescript
// Always define types for function parameters and return values
function fetchData(url: string): Promise<Data> {
  return fetch(url).then((response) => response.json())
}
// Use interfaces for object shapes and type definitions
interface User {
  id: string
  name: string
  email: string
  role: UserRole
}

// Use type for unions and intersections
type UserRole = 'admin' | 'user' | 'guest'
type ExtendedUser = User & { permissions: string[] }

// Use enums for related constants
const UserStatus = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  PENDING: 'pending'
} as const

// Use type assertions only when necessary
const value = someValue as string

// Use generics when appropriate for reusable components and functions
interface ListProps<T> {
  items: T[]
  renderItem: (item: T) => React.ReactNode
}

// Define custom types in a `types` directory
// Avoid type assertions (`as`) unless absolutely necessary
```

## React Development

### Component Structure
- Use functional components with hooks
- Keep components small and focused (ideally under 200 lines)
- Split large components into smaller, reusable ones
- Use proper prop types and default values
- Implement proper error boundaries
- Use React.memo for performance optimization when needed
- Follow the single responsibility principle
- Use custom hooks for reusable logic
- Implement proper loading and error states

### Component Organization

```typescript
// Component structure order
1. Imports (external, internal, types)
2. Type/Interface definitions
3. Component definition
4. Helper functions
5. Custom hooks
6. Return statement
// Example:
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { User } from '@/types';

interface UserCardProps {
  userId: string;
  onSelect: (user: User) => void;
}

const UserCard: React.FC<UserCardProps> = ({ userId, onSelect }) => {
  // State
  const [isLoading, setIsLoading] = useState(false);
  
  // Custom hooks
  const { data: user } = useUser(userId);
  
  // Helper functions
  const handleClick = () => {
    if (user) onSelect(user);
  };
  
  // Render
  return (
    <div className="user-card">
      {/* Component content */}
    </div>
  );
};
```

#### Import Order Conventions

```typescript
// 1. React and external libraries
import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useQuery } from '@tanstack/react-query'

// 2. Internal components
import { Button } from '@/components/common'
import { UserCard } from '@/components/features'

// 3. Hooks
import { useAuth } from '@/hooks'
import { useUser } from '@/hooks'

// 4. Utils and constants
import { formatDate } from '@/utils'
import { API_URL } from '@/constants'

// 5. Types
import type { User } from '@/types'
```

### Hooks Guidelines
- Use hooks at the top level of components
- Name custom hooks with 'use' prefix
- Keep hooks focused on a single responsibility
- Use proper dependency arrays in useEffect
- Handle cleanup in useEffect
- Use proper error handling in async hooks

```typescript
// Good hook example
const useUserData = (userId: string) => {
  const [data, setData] = useState<User | null>(null);
  const [error, setError] = useState<Error | null>(null);
  
  useEffect(() => {
    let isMounted = true;
    
    const fetchData = async () => {
      try {
        const response = await fetchUser(userId);
        if (isMounted) setData(response);
      } catch (err) {
        if (isMounted) setError(err as Error);
      }
    };
    
    fetchData();
    
    return () => {
      isMounted = false;
    };
  }, [userId]);
  
  return { data, error };
};
```

### State Management

- Use React Query for server state management
- Use Redux for global application state
- Use React Context for theme and other app-wide settings
- Keep state as close to where it's used as possible
- Use proper state initialization
- Implement proper error handling for async operations

## Styling Guidelines

### Tailwind CSS Conventions

#### Class Ordering
1. Layout (display, position, flex, grid)
2. Box Model (width, height, margin, padding)
3. Typography (font, text, color)
4. Visual (background, border, shadow)
5. Animation/Transition
6. State (hover, focus, active)

```typescript
// Good
<button className="flex items-center justify-center w-full h-10 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200">
  Click me
</button>

// Bad (unordered classes)
<button className="text-white bg-blue-600 flex items-center justify-center rounded-md hover:bg-blue-700 w-full h-10 px-4 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200">
  Click me
</button>
```

#### Responsive Design
- Use mobile-first approach
- Group responsive classes together
- Use consistent breakpoint prefixes
- Document complex responsive layouts

```typescript
// Good responsive example
<div className="
  flex flex-col
  md:flex-row md:items-center
  lg:justify-between
  space-y-4 md:space-y-0 md:space-x-4
">
  {/* Content */}
</div>
```

#### Component Styling
- Use @apply for repeated utility patterns
- Create reusable component classes
- Use CSS variables for theme values
- Keep styles modular and scoped

```typescript
// Component with Tailwind
const Card = styled.div`
  @apply bg-white rounded-lg shadow-md p-6;
  
  .card-header {
    @apply text-xl font-bold mb-4;
  }
  
  .card-content {
    @apply text-gray-600;
  }
`;
```

#### Animation
- Use transition-* utilities for simple animations
- Use @keyframes for complex animations
- Group animation classes together
- Document animation behavior

```typescript
// Animation example
<button className="
  transform transition-all duration-300
  hover:scale-105 hover:shadow-lg
  active:scale-95
">
  Animated Button
</button>
```

#### Best Practices
- Avoid inline styles unless absolutely necessary
- Use @layer components for custom styles
- Keep utility classes readable and maintainable
- Use meaningful class names for custom components
- Document complex style patterns
- Use CSS Grid and Flexbox appropriately
- Optimize for performance (avoid excessive nesting)

## Data Management

### Redux Toolkit Conventions

```typescript
// Slice naming convention: featureNameSlice.ts
// src/store/slices/authSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
}

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload
      state.isAuthenticated = true
    },
    // ... other reducers
  },
})

// Action naming convention: feature/action
export const { setUser } = authSlice.actions
export default authSlice.reducer
```

### GraphQL Conventions

```typescript
// Query naming convention: GET_ENTITY
// src/graphql/queries.ts
import { gql } from '@apollo/client'

export const GET_USER = gql`
  query GetUser($id: ID!) {
    user(id: $id) {
      id
      name
      email
      role
    }
  }
`

// Mutation naming convention: MUTATE_ENTITY
export const UPDATE_USER = gql`
  mutation UpdateUser($input: UpdateUserInput!) {
    updateUser(input: $input) {
      id
      name
      email
      role
    }
  }
`
```

### React Query Conventions

```typescript
// Query key naming convention: [entity, id, params]
// src/hooks/useData.ts
export const useUser = (id: string) => {
  return useQuery({
    queryKey: ['user', id],
    queryFn: () => api.getUser(id),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 30 * 60 * 1000, // 30 minutes
  })
}

// Mutation naming convention: useMutateEntity
export const useUpdateUser = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: UpdateUserInput) => api.updateUser(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(['user', variables.id])
    },
  })
}
```

### MQTT Conventions

```typescript
// Topic naming convention: entity/action
// src/lib/mqtt.ts
class MQTTClient {
  private static instance: MQTTClient
  private client: mqtt.Client | null = null

  private constructor() {}

  static getInstance(): MQTTClient {
    if (!MQTTClient.instance) {
      MQTTClient.instance = new MQTTClient()
    }
    return MQTTClient.instance
  }

  connect() {
    // Connection logic
  }

  subscribe(topic: string) {
    this.client?.subscribe(topic)
  }

  publish(topic: string, message: unknown) {
    this.client?.publish(topic, JSON.stringify(message))
  }
}
```

## Code Quality

### ESLint and Prettier Rules

```json
// .eslintrc.json
{
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "prettier"
  ],
  "plugins": ["@typescript-eslint", "react", "react-hooks"],
  "rules": {
    "react/react-in-jsx-scope": "off",
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn"
  }
}

// .prettierrc
{
  "semi": false,
  "singleQuote": true,
  "jsxSingleQuote": false,
  "tabWidth": 2,
  "trailingComma": "all",
  "printWidth": 120,
  "bracketSpacing": true,
  "bracketSameLine": true,
  "arrowParens": "always",
  "embeddedLanguageFormatting": "auto",
  "htmlWhitespaceSensitivity": "css",
  "insertPragma": false,
  "proseWrap": "preserve",
  "quoteProps": "as-needed",
  "requirePragma": false,
  "useTabs": false,
}
```

### Error Handling Conventions

```typescript
// src/utils/errors.ts
export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

// Usage in components
try {
  await api.getData()
} catch (error) {
  if (error instanceof ApiError) {
    // Handle API error
  } else {
    // Handle other errors
  }
}
```

### Code Commenting Conventions

```typescript
// Use JSDoc for functions, components, and complex types
/**
 * Fetches user data from the API
 * @param {string} id - The user ID
 * @returns {Promise<User>} The user object
 * @throws {ApiError} When the API request fails
 */
const fetchUser = async (id: string): Promise<User> => {
  // implementation
}

// For React components, document props
/**
 * UserProfile component displays user information and allows editing
 * @param {User} user - The user object to display
 * @param {(id: string) => void} onEdit - Callback when edit button is clicked
 * @param {boolean} [isEditable=true] - Whether the profile can be edited
 */
export const UserProfile: React.FC<UserProfileProps> = ({ user, onEdit, isEditable = true }) => {
  // implementation
}

// Use inline comments sparingly, only for non-obvious code
function calculateTotal(items: CartItem[]) {
  // Apply special discount for orders over $100
  if (subtotal > 100) {
    discount = subtotal * 0.1
  }
  
  return subtotal - discount + tax
}

// Comment pattern for sections within files
// =====================
// Authentication Logic
// =====================

// For temporary code, use TODO with a description and optionally an author/ticket reference
// TODO(username): Replace with API call when endpoint is ready (TICKET-123)
const dummyData: User[] = [
  { id: '1', name: 'John Doe' },
  { id: '2', name: 'Jane Smith' }
]

// For known issues, use FIXME with a description and details
// FIXME: This calculation is incorrect for negative values
const calculateVAT = (amount: number) => amount * 0.2

// Do NOT comment on obvious code
// BAD:
// Set the name variable to 'John'
const name = 'John'

// GOOD: Let the code speak for itself
const name = 'John'

// Use TypeScript instead of comments when possible
// BAD:
// items is an array of products with id, name, and price
const items = []

// GOOD: Let TypeScript document the structure
const items: Product[] = []

// For complex algorithms, comment on the approach rather than the mechanics
/**
 * Uses a modified binary search to find the closest value to target.
 * Time complexity: O(log n)
 * Space complexity: O(1)
 */
const findClosestValue = (array: number[], target: number): number => {
  // implementation
}
```

### Testing Conventions

```typescript
// Component testing with React Testing Library
describe('UserProfile', () => {
  it('displays user information correctly', () => {
    // Arrange
    const user = { name: 'John Doe', email: 'john@example.com' }
    
    // Act
    render(<UserProfile user={user} />)
    
    // Assert
    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('john@example.com')).toBeInTheDocument()
  })
  
  it('calls onEdit when edit button is clicked', () => {
    // Arrange
    const onEdit = jest.fn()
    
    // Act
    render(<UserProfile user={mockUser} onEdit={onEdit} />)
    userEvent.click(screen.getByRole('button', { name: /edit/i }))
    
    // Assert
    expect(onEdit).toHaveBeenCalledTimes(1)
    expect(onEdit).toHaveBeenCalledWith(mockUser.id)
  })
})

// Hook testing with renderHook
test('useCounter increments and decrements correctly', () => {
  // Arrange
  const { result } = renderHook(() => useCounter())
  
  // Act & Assert
  act(() => {
    result.current.increment()
  })
  expect(result.current.count).toBe(1)
  
  act(() => {
    result.current.decrement()
  })
  expect(result.current.count).toBe(0)
})
```

## Best Practices

### RORO Pattern

```typescript
// RORO (Receive an Object, Return an Object) pattern
// Instead of:
const getUserData = (id: string, includeProfile: boolean, language: string) => {
  // implementation
}

// Use:
interface GetUserDataParams {
  id: string
  includeProfile?: boolean
  language?: string
}

const getUserData = ({ id, includeProfile = false, language = 'en' }: GetUserDataParams) => {
  // implementation
  return { user, profile, settings }
}

// Usage
const { user, profile } = getUserData({
  id: '123',
  includeProfile: true
})
```

### Conditional and Null Handling

```typescript
// Prefer optional chaining and nullish coalescing
// Instead of:
const userName = user && user.profile && user.profile.name ? user.profile.name : 'Guest'

// Use:
const userName = user?.profile?.name ?? 'Guest'

// For boolean checks, use logical operators without unnecessary if statements
const isAdmin = user?.role === 'admin'
const canEdit = isAdmin || isEditor

// For conditional JSX rendering
{isLoading && <Spinner />}
{isError ? <ErrorMessage error={error} /> : null}
{data?.items?.length ? (
  <ItemList items={data.items} />
) : (
  <EmptyState message="No items found" />
)}
```

### Code Organization and Readability

```typescript
// Group related state variables
const [formState, setFormState] = useState({
  name: '',
  email: '',
  password: '',
})

// Organize event handlers alphabetically
const handleBlur = (e) => { /* implementation */ }
const handleChange = (e) => { /* implementation */ }
const handleSubmit = (e) => { /* implementation */ }

// Use guard patterns for complex conditional logic
const renderPaymentMethod = () => {
  if (!user) return <SignInPrompt />
  if (!paymentMethods.length) return <AddPaymentMethod />
  if (paymentMethods.length === 1) return <SinglePaymentMethod method={paymentMethods[0]} />
  
  return <PaymentMethodSelector methods={paymentMethods} />
}
```

### Performance Optimization Conventions

```typescript
// Memoize expensive calculations or components
const MemoizedExpensiveComponent = React.memo(ExpensiveComponent)

// Use useCallback for event handlers passed to child components
const handleClick = useCallback(() => {
  // implementation
}, [dependency1, dependency2])

// Use useMemo for expensive calculations
const sortedAndFilteredItems = useMemo(() => {
  return items
    .filter(item => item.isActive)
    .sort((a, b) => a.name.localeCompare(b.name))
}, [items])

// Prefer lazy loading for route components
const LazyDashboard = lazy(() => import('./pages/Dashboard'))

// Use the virtual list pattern for large datasets
const VirtualList = ({ items }) => (
  <VirtualizedList
    height={500}
    width="100%"
    itemCount={items.length}
    itemSize={50}
    renderItem={({ index, style }) => (
      <div style={style}>
        <ListItem item={items[index]} />
      </div>
    )}
  />
)
```

## Accessibility and Internationalization

```typescript
// Always use semantic HTML
// Instead of:
<div onClick={handleClick}>Click Me</div>

// Use:
<button onClick={handleClick}>Click Me</button>

// Always provide ARIA attributes when needed
<button 
  aria-label="Close dialog"
  aria-pressed={isPressed}
  onClick={closeDialog}
>
  <CloseIcon />
</button>

// Use react-intl or similar for internationalization
const messages = {
  greeting: 'Hello, {name}!',
  items: '{count, plural, =0 {No items} one {# item} other {# items}}'
}

// Use HTML lang attribute
<html lang={userLocale}>
  {/* content */}
</html>
```

## Return Data Model Conventions

```typescript
// Standard API response interface
interface ApiResponse<T> {
  data: T | null
  error: ErrorData | null
  meta?: {
    page?: number
    pageSize?: number
    totalPages?: number
    totalCount?: number
  }
}

// Error data structure
interface ErrorData {
  code: string
  message: string
  details?: Record<string, unknown>
}

// Example of a service function returning the standard response format
const fetchUsers = async (): Promise<ApiResponse<User[]>> => {
  try {
    const response = await api.get('/users')
    return {
      data: response.data,
      error: null,
      meta: response.meta
    }
  } catch (error) {
    return {
      data: null,
      error: {
        code: error.code || 'UNKNOWN_ERROR',
        message: error.message || 'An unknown error occurred'
      }
    }
  }
}

// For synchronous functions, use Result pattern to handle success/failure
type Result<T, E = Error> = 
  | { success: true; value: T }
  | { success: false; error: E }

// Example of using Result pattern
const parseConfig = (input: string): Result<Config> => {
  try {
    const config = JSON.parse(input)
    if (!isValidConfig(config)) {
      return {
        success: false,
        error: new Error('Invalid configuration format')
      }
    }
    return {
      success: true,
      value: config
    }
  } catch (error) {
    return {
      success: false,
      error
    }
  }
}

// Usage example with pattern matching
const result = parseConfig(inputString)
if (result.success) {
  // Type narrowed to { success: true, value: Config }
  const config = result.value
  // Use config...
} else {
  // Type narrowed to { success: false, error: Error }
  console.error(result.error)
}

// For React Query, standardize error and success types
interface QuerySuccessResponse<T> {
  data: T
  status: 'success'
}

interface QueryErrorResponse {
  status: 'error'
  error: {
    message: string
    code: string
  }
}

type QueryResponse<T> = QuerySuccessResponse<T> | QueryErrorResponse

// React Query usage example
const { data, isLoading, isError } = useQuery({
  queryKey: ['users'],
  queryFn: fetchUsers,
  select: (response: ApiResponse<User[]>) => {
    if (response.error) {
      throw new Error(response.error.message)
    }
    return response.data
  }
})
```

## Git Workflow

### Commit Message Format
```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

Types:
- feat: New feature
- fix: Bug fix
- docs: Documentation changes
- style: Code style changes
- refactor: Code refactoring
- chore: Maintenance tasks

## Additional Resources

- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [React Documentation](https://react.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [ESLint Rules](https://eslint.org/docs/rules/)
- [Prettier Configuration](https://prettier.io/docs/en/configuration.html)