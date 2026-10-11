# docViewer — Complete UI/UX Visual Redesign

## Objective

Redesign the entire docViewer application into a polished, modern document workspace that feels like a premium SaaS product built in 2026.

The current interface looks dated, resembling a basic HTML application from 2008. It has generic browser-like buttons, weak typography, insufficient visual hierarchy, excessive unused space, and no cohesive design system.

**This is a visual redesign of the existing application, not a rewrite of its functionality or architecture.**

Preserve all existing features, routes, data flows, permissions, and backend behavior. Improve the visual language, layout, usability, responsive behavior, and interaction design throughout the application.

## 1. Visual Direction

Create a sophisticated, minimal, editorial workspace with the following characteristics:

- Modern, clean, and professional.
- Warm neutral backgrounds rather than flat gray.
- Deep ink typography with strong hierarchy.
- Restrained indigo or violet accents for primary actions and active states.
- Subtle borders, layered surfaces, and carefully controlled shadows.
- Generous but intentional spacing.
- Refined micro-interactions and transitions.
- A distraction-free writing experience.

The interface should feel credible next to Linear, Notion, and modern productivity SaaS applications.

Avoid looking like a clone of any reference product. Establish a distinctive docViewer identity.

### Color system

Use CSS variables or Tailwind theme tokens. Apply the palette consistently across every route.

**Light theme**

- App background: `#F7F7F5`
- Sidebar background: `#F1F1EE`
- Primary surface: `#FFFFFF`
- Secondary surface: `#FAFAF9`
- Primary text: `#202124`
- Secondary text: `#6B7280`
- Muted text: `#9CA3AF`
- Border: `#E7E7E5`
- Strong border: `#D6D6D2`
- Primary accent: `#635BDB`
- Primary accent hover: `#5148C7`
- Accent subtle background: `#EEEDFF`
- Success: `#16845B`
- Destructive: `#DC4545`
- Focus ring: `rgba(99, 91, 219, 0.28)`

Use these values as the starting point, not an excuse to introduce accent colors everywhere.

The overall UI should remain predominantly neutral. Reserve indigo for primary actions, selected navigation, links, focus states, and meaningful highlights.

### Typography

Use **Inter** as the primary interface font, preferably through `next/font/google`. If an appropriate font is already configured, evaluate it before adding another dependency.

Typography rules:

- Application branding: 17–19px, weight 700.
- Page headings: 24–30px, weight 650–700.
- Document title: 30–36px, weight 650–700, tight letter spacing.
- Body interface text: 13–14px.
- Metadata and timestamps: 11–12px.
- Button labels: 13px, weight 500–600.
- Editor body: 16–17px, line-height 1.8.
- H1 inside document content: 30–34px.
- H2 inside document content: 24–28px.
- H3 inside document content: 19–21px.

Use a consistent typographic scale. Avoid making every element the same size or weight.

## 2. Application Shell

Rework the overall layout into three visually distinct regions:

1. Persistent left sidebar.
2. Main workspace header.
3. Main content area.

### Sidebar

Create a refined sidebar approximately 240–260px wide on desktop.

Structure:

**Brand section**
- Minimal document icon or custom monogram.
- `docViewer` wordmark.
- Small, muted account email beneath the brand if space permits.

**Navigation**
- All documents.
- Owned by me.
- Shared with me.

Each item should have a clean line icon, consistent spacing, a clear active state, and a comfortable click target.

The active navigation item should use a subtle tinted background, darker text, and an accent icon. Do not use thick borders or oversized pills.

**Bottom account section**
- Small avatar with initials.
- User name or email.
- Compact account menu.
- Log out action inside the menu rather than a permanently prominent bottom button.

Keep the sidebar anchored to the viewport height, with independently scrollable navigation if required.

On smaller screens, collapse the sidebar into a drawer or responsive navigation panel.

## 3. Documents Dashboard

Redesign the All Documents screen as a real workspace rather than a bare list of input controls.

### Workspace header

At the top of the content area, create a compact header containing:

- Page title: `All documents`.
- A short contextual subtitle such as `Your documents, all in one place`.
- Search input with search icon.
- Primary `New document` button.
- Secondary `Import` action.
- User menu if appropriate.

Use a maximum content width of approximately 1100–1200px, with responsive horizontal padding.

The search field should be visually integrated into the header, not stretched awkwardly across the entire screen.

### Filter navigation

Provide segmented or tab-style filters:

- All documents.
- Owned.
- Shared with me.

Use a subtle underline or soft selected background. Ensure the selected state is immediately recognizable.

Preserve the existing filtering logic.

### Document list

Replace the current plain text row with polished document list items.

Each item should include:

- Document icon or contextual file-type icon.
- Document title.
- Last updated information.
- Ownership or sharing status.
- Role indicator where relevant.
- Optional overflow menu for supported actions.

Use consistent row heights, alignment, hover states, and subtle separators or borders.

The list should feel light and organized, not like a table from an administration panel.

Do not invent unsupported features. Only show actions that actually exist in the application.

### Empty, loading, and error states

Design intentional states for:

- No documents yet.
- No search results.
- Loading documents.
- Failed document loading.

The empty state should include a tasteful illustration or simple document icon, a concise message, and a prominent Create document action.

Avoid excessive decorative graphics.

## 4. Document Editor

The editor is the most important screen. Prioritize the writing experience over decorative UI.

### Editor workspace

Use a calm, neutral workspace with a centered document canvas.

Recommended desktop structure:

- Workspace header: approximately 60–68px high.
- Document content width: 760–820px, adjustable for responsive screens.
- Editor canvas: white surface with subtle border or extremely soft shadow.
- Content padding: approximately 48–64px horizontally on desktop.
- Generous vertical space between the title, metadata, toolbar, and document body.

Avoid the current narrow, floating editor surrounded by a huge expanse of undifferentiated gray.

Do not make the canvas excessively wide. It should feel comfortable for reading and writing long-form content.

### Editor header

Create a compact navigation and action header with:

- Back to documents.
- Breadcrumb or document location.
- Save status.
- Share action.
- Export menu.
- Additional actions where already supported.

Keep the main actions aligned consistently. Use icons with accessible labels and tooltips when appropriate.

Replace raw text buttons with a cohesive button system:

- Primary: filled indigo.
- Secondary: neutral surface with a subtle border.
- Ghost: transparent, with hover background.
- Destructive: red, reserved for destructive operations.

Use consistent heights, padding, corner radii, and focus states.

### Document title

The document title should be visually prominent and directly editable.

- Use 30–36px typography.
- Remove heavy input borders.
- Use a transparent background in the default state.
- Show a subtle focus treatment while editing.
- Preserve existing rename and save behavior.

Display ownership and updated metadata beneath the title in small, muted text.

Make the metadata informative without competing with the document title.

### Formatting toolbar

Redesign the TipTap toolbar as a compact, refined formatting surface.

Support the existing formatting features:

- Bold.
- Italic.
- Underline.
- Heading 1.
- Heading 2.
- Heading 3.
- Bullet list.
- Numbered list.

Requirements:

- Use consistent Lucide icons where appropriate.
- Group related formatting controls.
- Separate groups using subtle dividers.
- Show active formatting states clearly.
- Provide tooltips and keyboard shortcuts where supported.
- Maintain visible keyboard focus.
- Avoid oversized buttons and inconsistent spacing.

Use a light neutral toolbar background with a subtle bottom border. A floating toolbar is optional only if it can be implemented without compromising current functionality.

Ensure toolbar actions operate on the current editor selection.

### Editor content

Style TipTap content with a proper document typography system.

- Body text should be comfortable to read.
- Paragraph spacing should feel natural.
- Headings should have clear hierarchy and margins.
- Lists should have consistent indentation.
- Bold, italic, and underline must render correctly.
- Long documents must remain easy to navigate and edit.

Preserve TipTap JSON as the source of truth. Do not replace the editor with a contentEditable implementation or plain HTML textarea.

Ensure the editor remains usable when the document is empty.

## 5. Sharing Experience

The sharing UI must feel like a polished collaboration feature.

Create a well-designed modal or dialog with:

- Clear `Share document` heading.
- Email address input.
- Role selector for Viewer and Editor.
- Primary Share or Grant access button.
- Existing shared users list.
- Role displayed beside each user.
- Revoke access action.
- Loading, validation, success, and error states.

Use clear role descriptions where helpful:

- Viewer — can read the document.
- Editor — can modify the document.

Use compact avatars or initials where appropriate.

Destructive actions such as revoking access should have a clear affordance and, where necessary, confirmation.

Preserve existing permission checks and sharing semantics. Do not expose editing controls to viewers.

## 6. Authentication Screens

Redesign login and signup into a premium, minimal authentication experience.

The current centered form is functional but visually generic.

Use:

- A clean, softly tinted background.
- A well-proportioned authentication card.
- Strong brand typography.
- Consistent form labels and spacing.
- Refined input borders and focus states.
- A distinctive primary submit button.
- Clear validation and authentication errors.
- A subtle link between login and signup.

Use approximately 400–440px maximum card width, with responsive padding.

Optional: Add a very subtle brand graphic, abstract document motif, or typography-led side panel on large screens. Keep the experience fast, restrained, and focused.

Do not add social login, password recovery, verification, or other authentication functionality unless it already exists or is separately approved.

Preserve email/password authentication and the existing authentication flow.

## 7. Import and Export

Style all existing import and export interactions consistently.

### Import

Provide a polished upload dialog or dropdown supporting the existing formats:

- `.txt`
- `.md`
- `.docx`

Include:

- Drag-and-drop area where supported.
- File picker.
- Supported file format information.
- Existing 5MB size limit.
- Clear invalid-file and parsing-error feedback.
- Loading state while importing.

Do not change the underlying parsing or file-size requirements.

### Export

Provide a consistent export menu for:

- Download `.docx`
- Download `.pdf`

Use compact menu items with appropriate icons and clear labels.

Preserve the current DOCX export and print-to-PDF behavior.

Make sure print styles remove application chrome and produce a readable document with appropriate margins and typography.

## 8. Interaction Design

Every visible interactive element must have appropriate states.

Implement:

- Smooth but restrained hover transitions.
- Visible active states.
- Keyboard focus indicators.
- Pressed button states.
- Disabled states.
- Loading indicators.
- Toast notifications for existing success and error events.
- Consistent modal open and close transitions.
- Responsive dropdowns and dialogs.

Keep transitions approximately 120–200ms.

Use subtle opacity, background-color, border-color, and transform transitions where appropriate.

Avoid excessive animations, parallax, glassmorphism, large gradients, and distracting motion.

Respect `prefers-reduced-motion`.

Do not add dependencies solely for decorative animations.

## 9. Component and Design System Requirements

Create or refine reusable UI primitives for:

- Button.
- Input.
- Dialog.
- Dropdown menu.
- Tooltip.
- Avatar.
- Badge.
- Toast.
- Document list item.
- Section header.
- Icon button.

Use the project's existing component library if one is already configured and appropriate.

If Shadcn UI is already present, use it consistently rather than introducing a competing component system. If not, use existing Tailwind CSS utilities and lightweight reusable components.

Use Lucide icons if the dependency is available; otherwise add `lucide-react` only if needed.

Establish shared design tokens for:

- Colors.
- Typography.
- Spacing.
- Border radii.
- Shadows.
- Focus rings.
- Transition timing.

Avoid duplicated one-off styling and arbitrary color values throughout the codebase.

## 10. Responsive Design

The application must work across desktop, tablet, and mobile.

**Desktop**
- Persistent sidebar.
- Centered document canvas.
- Full editor toolbar.
- Header actions aligned without wrapping.

**Tablet**
- Narrower sidebar or collapsible navigation.
- Reduced canvas padding.
- Responsive header actions.

**Mobile**
- Drawer-based navigation.
- Full-width document canvas.
- Reduced horizontal padding.
- Compact formatting toolbar that can horizontally scroll or group controls.
- Share and export menus that fit the viewport.
- Authentication forms sized for mobile.
- No horizontal page overflow.

Test representative viewport sizes, including 1440px, 1024px, 768px, and 390px widths.

## 11. Technical Constraints — Non-Negotiable

The existing application uses:

- Next.js App Router.
- React.
- TypeScript.
- Tailwind CSS v4.
- TipTap.
- MongoDB Atlas.
- Next.js Server Actions.
- Email/password authentication.

Preserve the existing architecture and behavior.

Do not:

- Rewrite the application from scratch.
- Replace MongoDB or the authentication system.
- Introduce Express or a separate backend.
- Replace TipTap.
- Change document storage formats or sharing permissions.
- Remove existing functionality.
- Hardcode user data or document contents.
- add fake document counts, fake activity, or mock collaboration.
- Add unnecessary dependencies.
- Disable TypeScript checks or linting to force a build.
- Modify server-side authorization to accommodate the UI.
- introduce hydration errors through browser-only APIs.

Keep Server Components as Server Components wherever possible. Use Client Components only for genuinely interactive elements.

Maintain accessibility, semantic HTML, and keyboard navigation.

## 12. Implementation Workflow

Before modifying the UI:

1. Inspect the current project structure, routes, components, dependencies, and global styles.
2. Identify existing reusable components and the current Tailwind configuration.
3. Map each existing screen to its corresponding component.
4. Identify functional behavior that must remain unchanged.
5. Implement the redesign incrementally using shared design tokens and components.

Then redesign in this order:

1. Global design system and application shell.
2. Documents dashboard and sidebar.
3. Document editor and formatting toolbar.
4. Sharing dialog.
5. Login and signup.
6. Import/export interactions.
7. Responsive behavior and interaction polish.

After implementation:

- Run TypeScript checks.
- Run linting.
- Run existing tests.
- Fix any regressions introduced by the redesign.
- Verify the existing document CRUD, autosave, search, sharing, import, and export flows.
- Test viewer and editor permissions.
- Check mobile layouts and overflow.
- Verify loading, empty, and error states.

Do not claim that a flow works unless it has actually been verified.

## 13. Acceptance Criteria

The redesign is complete only when:

- The app no longer resembles a default HTML form or a dated CRUD dashboard.
- Every screen uses a consistent visual language.
- Typography has deliberate hierarchy and appropriate line lengths.
- Primary actions are visually obvious without overwhelming the interface.
- The sidebar, document list, editor, and dialogs look like one product.
- The editor is comfortable for sustained writing.
- The layout adapts correctly to desktop and mobile.
- Every existing feature continues to work.
- No permission or authentication regression is introduced.
- No unnecessary architectural changes are made.
- TypeScript, linting, and existing tests pass, or pre-existing failures are clearly identified.

**Final direction:** Build a calm, precise, premium writing workspace. Favor typography, alignment, spacing, and subtle contrast over decorative effects. The result should look intentionally designed, not merely styled.