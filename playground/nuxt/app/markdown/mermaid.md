# Mermaid Diagrams

> Create interactive flowcharts, sequence diagrams, and more with Mermaid support.

## Basic Usage

Use a `mermaid` code block to turn a small decision into a diagram. Switch between **Preview** and **Source** to see how it is written.

```mermaid
flowchart TB
    A([Response]) --> B{Mode}
    B -->|Streaming| C[Complete syntax]
    B -->|Static| D[Use original source]
    C --> E[Animate new text]
    D --> F[Show document]
```

## Diagram Types

### Flowcharts

Follow Markdown from one source into different kinds of rendered content:

```mermaid
flowchart TB
    A([Markdown]) --> B[Parse content]
    B --> C[Text]
    B --> D[Code]
    B --> E[Diagrams]
    C --> F[Vue typography]
    D --> G[Syntax highlighting]
    E --> H[Mermaid preview]
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

Show a short exchange between an app, an API, and a model:

```mermaid
sequenceDiagram
    participant App
    participant API
    participant Model

    App->>API: Send prompt
    API->>Model: Generate
    Model-->>API: Text chunk
    API-->>App: Update response
```

**Arrow Types:**

- `->` - Solid line
- `-->` - Dotted line
- `->>` - Solid arrow
- `-->>` - Dotted arrow

### State Diagrams

Show the possible outcomes of an active response:

```mermaid
stateDiagram-v2
    direction TB
    Streaming --> Complete: finish
    Streaming --> Cancelled: stop
    Streaming --> Failed: error
```

### Class Diagrams

Document object-oriented designs:

```mermaid
classDiagram
    direction LR
    class User {
        +String name
        +String email
        +login()
    }
    class Post {
        +String title
        +String content
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
    direction LR
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
```

### Git Graphs

Visualize Git workflows:

```mermaid
gitGraph
    commit id: "init"
    branch feature
    checkout feature
    commit id: "add preview"
    checkout main
    commit id: "docs"
    merge feature id: "release"
```

### XY Data Charts

Render bar, line, and combined XY charts:

```mermaid
xychart-beta
    title "Monthly Active Users"
    x-axis [Jan, Feb, Mar, Apr, May, Jun]
    y-axis "Users (k)" 0 --> 80
    bar [22, 30, 41, 53, 61, 72]
    line [18, 28, 39, 49, 58, 70]
```
