# Mermaid Diagrams

> Create interactive flowcharts, sequence diagrams, and more with Mermaid support.

## Basic Usage

Create Mermaid diagrams using code blocks with the `mermaid` language identifier:

```mermaid
graph TD
    A[Start] --> B{Decision}
    B -->|Yes| C[Success]
    B -->|No| D[Try Again]
    D --> B
```

## Diagram Types

### Flowcharts

Create flowcharts to visualize processes and workflows:

```mermaid
graph TD
    A[Christmas] -->|Get money| B(Go shopping)
    B --> C{Let me think}
    C -->|One| D[Laptop]
    C -->|Two| E[iPhone]
    C -->|Three| F[Car]
```

**Node Shapes:**
- `[text]` - Rectangle
- `(text)` - Rounded rectangle
- `{text}` - Rhombus (decision)
- `((text))` - Circle
- `[[text]]` - Subroutine shape

**Direction:**
- `graph TD` - Top to bottom
- `graph LR` - Left to right
- `graph BT` - Bottom to top
- `graph RL` - Right to left

### Sequence Diagrams

Visualize interactions between different actors or systems:

```mermaid
sequenceDiagram
    participant User
    participant Browser
    participant Server
    participant Database

    User->>Browser: Enter URL
    Browser->>Server: HTTP Request
    Server->>Database: Query data
    Database-->>Server: Return results
    Server-->>Browser: HTTP Response
    Browser-->>User: Display page
```

**Arrow Types:**
- `->` - Solid line
- `-->` - Dotted line
- `->>` - Solid arrow
- `-->>` - Dotted arrow

### State Diagrams

Model state machines and state transitions:

```mermaid
stateDiagram-v2
    [*] --> Idle
    Idle --> Loading: start
    Loading --> Success: data received
    Loading --> Error: failed
    Success --> Idle: reset
    Error --> Loading: retry
    Success --> [*]
```

### Class Diagrams

Document object-oriented designs:

```mermaid
classDiagram
    class User {
        +String name
        +String email
        +login()
        +logout()
    }
    class Post {
        +String title
        +String content
        +Date createdAt
        +publish()
    }
    User "1" --> "*" Post: creates
```

### Pie Charts

Display proportional data:

```mermaid
pie title Project Time Distribution
    "Development" : 45
    "Testing" : 20
    "Documentation" : 15
    "Meetings" : 20
```

### Gantt Charts

Plan and track project timelines:

```mermaid
gantt
    title Project Schedule
    dateFormat YYYY-MM-DD
    section Design
    Wireframes       :2024-01-01, 7d
    Mockups         :2024-01-08, 7d
    section Development
    Frontend        :2024-01-15, 14d
    Backend         :2024-01-15, 14d
    section Testing
    QA Testing      :2024-01-29, 7d
```

### Entity Relationship Diagrams

Model database relationships:

```mermaid
erDiagram
    USER ||--o{ POST : creates
    USER {
        int id PK
        string email
        string name
    }
    POST {
        int id PK
        int userId FK
        string title
        text content
    }
    POST ||--o{ COMMENT : has
    COMMENT {
        int id PK
        int postId FK
        string content
    }
```

### Git Graphs

Visualize Git workflows:

```mermaid
gitGraph
    commit
    commit
    branch develop
    checkout develop
    commit
    commit
    checkout main
    merge develop
    commit
```
