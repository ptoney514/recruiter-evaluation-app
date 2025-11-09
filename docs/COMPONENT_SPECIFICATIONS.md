# Component Specifications - Project Enhancements

## Design Tokens & Variables

### Colors
```css
--primary-50: #EFF6FF;
--primary-100: #DBEAFE;
--primary-500: #3B82F6;
--primary-600: #2563EB;
--primary-700: #1D4ED8;

--success-50: #ECFDF5;
--success-500: #10B981;
--success-600: #059669;

--warning-50: #FFFBEB;
--warning-500: #F59E0B;
--warning-600: #D97706;

--danger-50: #FEF2F2;
--danger-500: #EF4444;
--danger-600: #DC2626;

--gray-50: #F9FAFB;
--gray-100: #F3F4F6;
--gray-200: #E5E7EB;
--gray-300: #D1D5DB;
--gray-400: #9CA3AF;
--gray-500: #6B7280;
--gray-600: #4B5563;
--gray-700: #374151;
--gray-800: #1F2937;
--gray-900: #111827;
```

### Spacing Scale
```css
--space-1: 0.25rem;  /* 4px */
--space-2: 0.5rem;   /* 8px */
--space-3: 0.75rem;  /* 12px */
--space-4: 1rem;     /* 16px */
--space-5: 1.25rem;  /* 20px */
--space-6: 1.5rem;   /* 24px */
--space-8: 2rem;     /* 32px */
--space-10: 2.5rem;  /* 40px */
--space-12: 3rem;    /* 48px */
```

### Border Radius
```css
--radius-sm: 0.375rem;  /* 6px */
--radius-md: 0.5rem;    /* 8px */
--radius-lg: 0.75rem;   /* 12px */
--radius-xl: 1rem;      /* 16px */
--radius-full: 9999px;
```

### Shadows
```css
--shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
--shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
--shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);
--shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1);
```

---

## Component: EditProjectModal

### Visual Specification

**Dimensions:**
- Width: 640px (max-width)
- Padding: 24px
- Max Height: 90vh with scroll

**Structure:**
```jsx
<Modal>
  <Header>
    <Title>Edit Project</Title>
    <CloseButton />
  </Header>

  <Form>
    <FormField label="Job Title" required>
      <Input />
    </FormField>

    <FormRow>
      <FormField label="Department" required>
        <Input />
      </FormField>
      <FormField label="Location">
        <Input />
      </FormField>
    </FormRow>

    <FormRow>
      <FormField label="Employment Type">
        <Select />
      </FormField>
      <FormField label="Status">
        <StatusSelect />
      </FormField>
    </FormRow>

    <FormRow>
      <FormField label="Min Compensation">
        <Input type="number" />
      </FormField>
      <FormField label="Max Compensation">
        <Input type="number" />
      </FormField>
    </FormRow>

    <FormField label="Tags">
      <TagsInput />
    </FormField>

    <FormField label="Due Date">
      <DatePicker />
    </FormField>

    <FormField label="Job Description">
      <Textarea rows={6} />
    </FormField>
  </Form>

  <Footer>
    <Button variant="secondary">Cancel</Button>
    <Button variant="primary">Save Changes</Button>
  </Footer>
</Modal>
```

**Styling:**
```css
.edit-project-modal {
  background: white;
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-xl);
  max-width: 640px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
}

.edit-project-modal__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-6);
  border-bottom: 1px solid var(--gray-200);
}

.edit-project-modal__title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--gray-900);
}

.edit-project-modal__form {
  padding: var(--space-6);
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.edit-project-modal__footer {
  display: flex;
  gap: var(--space-3);
  padding: var(--space-6);
  border-top: 1px solid var(--gray-200);
}
```

**Interactions:**
- Input focus: Blue ring (ring-2 ring-primary-500)
- Button hover: Darken by 10%
- Validation errors: Red border + error message below field
- Loading state: Disable inputs, show spinner on save button

---

## Component: TagsInput

### Visual Specification

**Appearance:**
```
┌────────────────────────────────────────────────┐
│ [urgent ×] [remote-ok ×] [senior ×] Type...   │
└────────────────────────────────────────────────┘
```

**Structure:**
```jsx
<TagsInput value={tags} onChange={setTags}>
  {tags.map(tag => (
    <Tag key={tag}>
      {tag}
      <RemoveButton onClick={() => removeTag(tag)} />
    </Tag>
  ))}
  <Input
    placeholder="Add tag..."
    onKeyDown={handleKeyDown}
  />
</TagsInput>
```

**Styling:**
```css
.tags-input {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  padding: var(--space-2);
  border: 1px solid var(--gray-300);
  border-radius: var(--radius-md);
  min-height: 42px;
}

.tags-input:focus-within {
  outline: 2px solid var(--primary-500);
  outline-offset: 2px;
}

.tag {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-1) var(--space-2);
  background: var(--primary-100);
  color: var(--primary-700);
  border-radius: var(--radius-sm);
  font-size: 0.875rem;
}

.tag__remove {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  border-radius: var(--radius-full);
  background: transparent;
  color: var(--primary-600);
  cursor: pointer;
}

.tag__remove:hover {
  background: var(--primary-200);
}
```

**Behavior:**
- Enter key: Add tag
- Backspace on empty input: Remove last tag
- Comma or space: Add tag separator
- Duplicate tags: Not allowed, show toast
- Max tags: 10

---

## Component: CandidateCard

### Visual Specification

**Appearance:**
```
┌────────────────────────────────────────────────────────────┐
│ 💚 John Doe                              Score: 92/100     │
│    Software Engineer @ Google • 7 years exp                │
│    Skills: React, TypeScript, Node.js, AWS                 │
│    [View Resume] [View Evaluation] [Schedule Interview]    │
└────────────────────────────────────────────────────────────┘
```

**Structure:**
```jsx
<CandidateCard candidate={candidate}>
  <Header>
    <StatusIcon status={candidate.status} />
    <Name>{candidate.name}</Name>
    <Score>{candidate.score}/100</Score>
  </Header>

  <Details>
    <Title>{candidate.current_title}</Title>
    <Meta>
      {candidate.current_company} • {candidate.years_experience} years exp
    </Meta>
  </Details>

  <Skills>
    {candidate.skills.map(skill => (
      <SkillBadge key={skill}>{skill}</SkillBadge>
    ))}
  </Skills>

  <Actions>
    <Button size="sm" variant="secondary">View Resume</Button>
    <Button size="sm" variant="secondary">View Evaluation</Button>
    <Button size="sm" variant="primary">Schedule Interview</Button>
  </Actions>
</CandidateCard>
```

**Styling:**
```css
.candidate-card {
  background: white;
  border: 1px solid var(--gray-200);
  border-radius: var(--radius-lg);
  padding: var(--space-4);
  transition: all 0.2s;
}

.candidate-card:hover {
  box-shadow: var(--shadow-md);
  border-color: var(--primary-300);
}

.candidate-card__header {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  margin-bottom: var(--space-2);
}

.candidate-card__status-icon {
  width: 24px;
  height: 24px;
  border-radius: var(--radius-full);
}

.status-icon--strong-hire {
  background: var(--success-500);
  color: white;
}

.status-icon--hire {
  background: var(--primary-500);
  color: white;
}

.status-icon--phone-screen {
  background: var(--warning-500);
  color: white;
}

.status-icon--decline {
  background: var(--gray-400);
  color: white;
}

.candidate-card__name {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--gray-900);
  flex: 1;
}

.candidate-card__score {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--primary-600);
}

.candidate-card__details {
  margin-bottom: var(--space-3);
}

.candidate-card__title {
  font-size: 0.875rem;
  color: var(--gray-700);
  margin-bottom: var(--space-1);
}

.candidate-card__meta {
  font-size: 0.875rem;
  color: var(--gray-600);
}

.candidate-card__skills {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  margin-bottom: var(--space-4);
}

.skill-badge {
  padding: var(--space-1) var(--space-2);
  background: var(--gray-100);
  color: var(--gray-700);
  border-radius: var(--radius-sm);
  font-size: 0.75rem;
}

.candidate-card__actions {
  display: flex;
  gap: var(--space-2);
  flex-wrap: wrap;
}
```

---

## Component: UploadResumesModal

### Visual Specification

**Structure:**
```jsx
<Modal>
  <Header>
    <Title>Upload Resumes</Title>
    <CloseButton />
  </Header>

  <DropZone
    onDrop={handleDrop}
    accept=".pdf,.docx,.txt"
    maxSize={10485760} // 10MB
  >
    <Icon name="upload" size="large" />
    <Text>Click or drag files here</Text>
    <Caption>Supports PDF, DOCX, TXT (max 10MB)</Caption>
  </DropZone>

  {files.length > 0 && (
    <FileList>
      {files.map(file => (
        <FileItem key={file.id}>
          <FileIcon status={file.status} />
          <FileName>{file.name}</FileName>
          <FileSize>{formatSize(file.size)}</FileSize>
          <RemoveButton onClick={() => removeFile(file.id)} />
        </FileItem>
      ))}
    </FileList>
  )}

  <Options>
    <Checkbox label="Auto-evaluate after upload" />
    <Checkbox label="Send email notifications to candidates" />
  </Options>

  <Footer>
    <Button variant="secondary">Cancel</Button>
    <Button variant="primary" disabled={files.length === 0}>
      Upload ({validFilesCount})
    </Button>
  </Footer>
</Modal>
```

**Styling:**
```css
.upload-modal__dropzone {
  border: 2px dashed var(--gray-300);
  border-radius: var(--radius-lg);
  padding: var(--space-10);
  text-align: center;
  background: var(--gray-50);
  cursor: pointer;
  transition: all 0.2s;
}

.upload-modal__dropzone:hover {
  border-color: var(--primary-500);
  background: var(--primary-50);
}

.upload-modal__dropzone--active {
  border-color: var(--primary-600);
  background: var(--primary-100);
}

.upload-modal__file-list {
  max-height: 300px;
  overflow-y: auto;
  margin-top: var(--space-4);
  border: 1px solid var(--gray-200);
  border-radius: var(--radius-md);
}

.file-item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3);
  border-bottom: 1px solid var(--gray-200);
}

.file-item:last-child {
  border-bottom: none;
}

.file-item--success {
  background: var(--success-50);
}

.file-item--error {
  background: var(--danger-50);
}

.file-icon {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
}

.file-icon--success {
  background: var(--success-500);
  color: white;
}

.file-icon--error {
  background: var(--danger-500);
  color: white;
}

.file-name {
  flex: 1;
  font-size: 0.875rem;
  color: var(--gray-900);
  font-weight: 500;
}

.file-size {
  font-size: 0.875rem;
  color: var(--gray-600);
}
```

---

## Component: ProjectInfoSidebar

### Visual Specification

**Appearance:**
```
┌─── Project Info ──────────┐
│                            │
│ 📅 Created                 │
│    Nov 9, 2025             │
│                            │
│ 👤 Owner                   │
│    Pernell Toney           │
│                            │
│ 📝 Last Updated            │
│    2 hours ago             │
│                            │
│ 🏷️  Tags                    │
│    [urgent] [remote-ok]    │
│                            │
│ 📆 Due Date                │
│    Dec 15, 2025            │
│                            │
│ 👥 Hiring Manager          │
│    Sarah Johnson           │
│                            │
│ 📍 Work Location           │
│    Hybrid                  │
│                            │
└────────────────────────────┘
```

**Structure:**
```jsx
<ProjectInfoSidebar project={project}>
  <Card>
    <CardHeader>
      <Title>Project Info</Title>
    </CardHeader>

    <CardBody>
      <InfoItem icon="calendar" label="Created">
        {formatDate(project.created_at)}
      </InfoItem>

      <InfoItem icon="user" label="Owner">
        {project.owner.name}
      </InfoItem>

      <InfoItem icon="clock" label="Last Updated">
        {formatRelativeTime(project.updated_at)}
      </InfoItem>

      <InfoItem icon="tag" label="Tags">
        <Tags tags={project.tags} />
      </InfoItem>

      {project.due_date && (
        <InfoItem icon="calendar-check" label="Due Date">
          {formatDate(project.due_date)}
        </InfoItem>
      )}

      {project.hiring_manager && (
        <InfoItem icon="users" label="Hiring Manager">
          {project.hiring_manager}
        </InfoItem>
      )}

      <InfoItem icon="map-pin" label="Work Location">
        {project.work_location}
      </InfoItem>
    </CardBody>
  </Card>
</ProjectInfoSidebar>
```

**Styling:**
```css
.project-info-sidebar {
  position: sticky;
  top: var(--space-4);
}

.info-item {
  display: flex;
  gap: var(--space-3);
  padding: var(--space-3) 0;
  border-bottom: 1px solid var(--gray-100);
}

.info-item:last-child {
  border-bottom: none;
}

.info-item__icon {
  width: 20px;
  height: 20px;
  color: var(--gray-400);
  flex-shrink: 0;
}

.info-item__content {
  flex: 1;
}

.info-item__label {
  font-size: 0.75rem;
  color: var(--gray-600);
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: var(--space-1);
}

.info-item__value {
  font-size: 0.875rem;
  color: var(--gray-900);
}
```

---

## Responsive Design

### Breakpoints
```css
/* Mobile First */
@media (min-width: 640px)  { /* sm */ }
@media (min-width: 768px)  { /* md */ }
@media (min-width: 1024px) { /* lg */ }
@media (min-width: 1280px) { /* xl */ }
@media (min-width: 1536px) { /* 2xl */ }
```

### Mobile Adaptations (<768px)

**ProjectDetailPage:**
- Stack all sections vertically
- Full-width cards
- Bottom sticky action bar
- Tabs become accordion
- Reduced padding (16px instead of 24px)

**CandidateCard:**
- Stack actions vertically
- Hide secondary actions in menu
- Truncate long text with ellipsis

**EditProjectModal:**
- Full screen modal
- Single column form
- Sticky footer with actions

---

## Accessibility

### ARIA Labels
```html
<button aria-label="Edit project">
  <PencilIcon />
</button>

<input
  aria-describedby="title-error"
  aria-invalid={errors.title ? "true" : "false"}
/>

<div role="alert" id="title-error">
  Title is required
</div>
```

### Keyboard Navigation
- Tab order: Logical flow top-to-bottom, left-to-right
- Escape: Close modals
- Enter: Submit forms
- Arrow keys: Navigate menus and lists
- Focus visible: 2px ring on all interactive elements

### Screen Reader Support
- Semantic HTML (header, main, nav, section)
- Alt text on all images
- Label associations for all form inputs
- Status announcements for dynamic content

---

## Animation & Transitions

### Durations
```css
--duration-fast: 150ms;
--duration-normal: 200ms;
--duration-slow: 300ms;
```

### Easing
```css
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
--ease-out: cubic-bezier(0, 0, 0.2, 1);
--ease-in: cubic-bezier(0.4, 0, 1, 1);
```

### Common Transitions
```css
/* Hover */
transition: all var(--duration-normal) var(--ease-in-out);

/* Modal enter */
@keyframes modal-enter {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* Card lift */
.card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}
```

---

## Performance Considerations

### Code Splitting
```jsx
const EditProjectModal = lazy(() => import('./EditProjectModal'))
const CandidateDetailPage = lazy(() => import('./CandidateDetailPage'))
```

### Image Optimization
- Use WebP format with PNG fallback
- Lazy load images below fold
- Max width 1200px
- Compress to <100KB

### Virtual Scrolling
- Use react-window for candidate lists > 50 items
- Render only visible items + buffer

### Debounce Search
```jsx
const debouncedSearch = useMemo(
  () => debounce((query) => setSearchQuery(query), 300),
  []
)
```

---

## Implementation Priority

### P0 (Must Have - Week 1)
1. EditProjectModal
2. Project menu dropdown
3. Basic project info display
4. Update project mutation

### P1 (Should Have - Week 2)
1. TagsInput component
2. Archive/delete functionality
3. Duplicate project
4. Enhanced project detail layout

### P2 (Nice to Have - Week 3)
1. Upload resumes modal
2. Candidate cards
3. Search/filter
4. Bulk actions

### P3 (Future)
1. Real-time updates
2. Comments system
3. Team collaboration
4. Advanced analytics
