**Gabriela Brailovsky - Personal Portfolio Website**

This repository contains the source code for my personal portfolio website, designed to showcase my skills, projects, and professional background as a Software Engineer.
The website is built from scratch using only vanilla HTML, CSS, and JavaScript, demonstrating a strong foundation in core web technologies.

**Key Features**

Professional Dark Theme: A sleek and modern design with a blue-purple-black ombre gradient, providing an immersive user experience.

Fully Responsive Design: Adapts seamlessly to all screen sizes, from mobile phones to desktop monitors, using modern CSS techniques.

Interactive UI/UX: Engaging hover effects, smooth scrolling, and animated skill bars create a dynamic and professional feel.

Projects Showcase: A scrollable gallery to display my work, complete with descriptions and links to the GitHub repositories.

Functional Contact Form: Integrated with EmailJS to send messages directly to my inbox, including form validation and success/error handling.

Downloadable Resume: A dedicated section allowing visitors to easily download my CV.

Secure Credential Management: Utilizes GitHub Actions and GitHub Secrets to manage API keys securely, preventing exposure in the public repository.

**Technologies Used**

This project was built with a focus on fundamental web development skills, enhanced with modern tools for a professional and secure result.

HTML5: For the structure and semantic content of the website.

CSS3: For all styling, layout, and animations.

Flexbox & Grid: Used for all major layout components to create a responsive and modern design.

CSS Variables: For maintainable and consistent theming across the site.

Media Queries: For the fully responsive mobile-first design.

Google Fonts: For improved typography (Poppins).

Vanilla JavaScript: For all interactive elements, including:

Mobile navigation menu.

DOM manipulation for UI feedback.

Client-side form validation.

EmailJS: To handle secure email sending from the client-side contact form without a dedicated backend.

GitHub Actions & Secrets: For CI/CD, automating the deployment process to GitHub Pages and securely injecting environment variables (API keys) at build time.

**Deployment**

This website is automatically deployed to GitHub Pages. The deployment process is managed by a GitHub Actions workflow defined in .github/workflows/deploy.yml.

The workflow ensures that:

The code is checked out.

Secure API keys (stored in GitHub Secrets) are safely injected into the code.

The updated site is published to the gh-pages branch.

This automated and secure workflow keeps my credentials safe while ensuring the live site is always up-to-date with the latest changes pushed to the main branch.
