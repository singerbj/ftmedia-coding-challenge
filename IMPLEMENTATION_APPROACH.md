## Problem #5: Internal Team Dashboard with AI Assistant

I accomplished **Problem #5**, the _Internal Team Dashboard with AI Assistant_.

I chose this option to highlight my ability to **execute on a full-stack project quickly** — which is essential for the role you’re hiring for.  
If you can’t execute across the stack, you only have part of a product — and that product can’t be shipped or make you money.

---

### Full Stack Implementation

I focused on a full-stack implementation leveraging:

- **React**
- **TypeScript**
- **Next.js**
- **Convex.dev**
- **Radix UI**
- **Tailwind CSS**
- **Framer Motion**
- **Vercel AI SDK**
- **Jest** and **React Testing Library** (for tests)

The current implementation supports real time updates when multiple users are using the tool. When one person pins/saves a chat, it will update for all users. This isn't truly ideal, but highlights the ability to add collaborative features in the future if desired.

There are several `.md` files in the repo that highlight the **design** and **architecture** of various parts of the implementation.

I also leveraged **Claude Code** heavily to maximize efficiency during my 6-hour time limit.

---

### What Could’ve Been Done Differently

1. **Cross-Functional Collaboration**  
   Since this was a coding exercise, I didn’t take time to communicate and collaborate cross-functionally to clarify requirements or iterate with stakeholders.  
   In a real-world project, I would:
   - Schedule regular check-ins and demos.
   - Use a project management tool to track tasks and ensure alignment with the project’s _definition of done_.

2. **End-to-End Testing (E2E)**  
   I didn’t add any E2E tests for this version.  
   In a production scenario, I would consider E2E testing depending on:
   - Project type
   - UX complexity
   - Interaction depth

3. **Unit Testing**  
   I did include **unit and component tests** using Jest and React Testing Library.
   While the test suites pass, I did not have time to iron out some TypeSript issues. Easily done with a bit more time.

4. **User Authentication & Authorization**  
   In a real-world version, I would add a user system with authentication and authorization.  
   I intentionally omitted this due to the project’s defined scope and to focus on the core functionality.

5. **Additional Considerations**  
   There are several other technical and design tradeoffs I could discuss further if helpful.
