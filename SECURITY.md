# Security notes

This deployment is a static GitHub Pages portfolio.

Implemented: HTTPS deployment target, no database, no authentication/admin routes, no file-upload endpoint, no contact form storage, no third-party analytics SDK, escaped/static content, accessibility focus states, and reduced-motion support.

Not applicable to a purely static site: SQL injection, CSRF on a server form, server-side rate limiting, database rules, server-side auth/permissions, secure file uploads, and server environment variables. If a backend is added later, implement those controls server-side before launch.

Repository hygiene: do not commit API keys, tokens, passwords, service credentials, or private certificates. Review repository history before public release.

Recommended deployment checks: GitHub Pages HTTPS enabled; verify canonical URLs, Search Console ownership, sitemap submission, CSP/security headers where the hosting layer supports them, and production asset caching/compression.
