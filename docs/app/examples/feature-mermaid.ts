const basicFlowchart = `
\`\`\`mermaid
graph TD
    A[Start] --> B{Decision}
    B -->|Yes| C[Success]
    B -->|No| D[Try Again]
    D --> B
\`\`\`
`

const flowchart = `
\`\`\`mermaid
graph TD
    A[Christmas] -->|Get money| B(Go shopping)
    B --> C{Let me think}
    C -->|One| D[Laptop]
    C -->|Two| E[iPhone]
    C -->|Three| F[Car]
\`\`\`
`

const sequenceDiagram = `
\`\`\`mermaid
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
\`\`\`
`

const stateDiagram = `
\`\`\`mermaid
stateDiagram-v2
    [*] --> Idle
    Idle --> Loading: start
    Loading --> Success: data received
    Loading --> Error: failed
    Success --> Idle: reset
    Error --> Loading: retry
    Success --> [*]
\`\`\`
`

const classDiagram = `
\`\`\`mermaid
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
\`\`\`
`

const pieChart = `
\`\`\`mermaid
pie title Project Time Distribution
    "Development" : 45
    "Testing" : 20
    "Documentation" : 15
    "Meetings" : 20
\`\`\`
`

const ganttChart = `
\`\`\`mermaid
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
\`\`\`
`

const erDiagram = `
\`\`\`mermaid
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
\`\`\`
`

const gitGraph = `
\`\`\`mermaid
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
\`\`\`
`

const styledNode = `
\`\`\`mermaid
graph TD
    A[Node]
    style A fill:#f9f,stroke:#333,stroke-width:4px
\`\`\`
`

const subgraph = `
\`\`\`mermaid
graph TD
    subgraph Group A
        A1 --> A2
    end
    subgraph Group B
        B1 --> B2
    end
    A2 --> B1
\`\`\`
`

export { basicFlowchart, classDiagram, erDiagram, flowchart, ganttChart, gitGraph, pieChart, sequenceDiagram, stateDiagram, styledNode, subgraph }
