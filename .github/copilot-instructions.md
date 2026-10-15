---
description: "Specific rules for the code review agent on Pull Requests."
excludeAgent: "coding" 
---
# Copilot Code Review Instructions

## Project structure
- Source files should be placed in the `src` directory
- No generated or compiled files are present in the repository, like a `dist` folder.
- Example files from Vite should not be present in the repository, like `counter.ts` unless its code has been modified.

## TypeScript Quality
Evaluate TypeScript quality:

- Correct use of types and interfaces
- Avoiding any unless justified
- Proper function signatures
- Clean, readable code

## Error handling
Look for:
- Input validation
- Handling invalid amounts
- Preventing crashes

## Code style
Assess:
- Naming clarity
- Consistent formatting
- Comments where helpful
- No unused variables or dead code
- Duplicate code blocks

### General code quality and best practices per file type
#### General
- Check that the primary files are not located under the `.github` folder but are at root level.
- Check for any spelling errors.

#### .gitignore
- Check that there is a `.gitignore` file present.
- Check that the `.gitignore` file has the most commonly ignored files defined.

#### HTML
##### General
- Check that the `lang` attribute in the `<html>` tag is consistent with the page language.
- Check that the language is consistent throughout the document, i.e. no mixing of Swedish, English and any other languages.
- Check that semantic tags are used as widely as possible.
- Check if there are any unnecessary `tabindex` attributes set.
- Check that there is only one `<h1>` tag in the HTML document.
- Check that no heading levels are skipped.
- Check that no text is written in uppercase. If it is written in uppercase, recommend the author to consider setting the uppercase property in CSS instead.
- Check that the code is correctly and consistently indented.
- Ensure there is one single `<main>` tag present in the HTML document.

##### Image tags
- Ensure images have a descriptive `alt`-text set and that the text doesn't contain "Picture of" or "Bild på".
- Ensure images have `width` and `height` attributes set.
- If the image tag is missing `loading="lazy"`, recommend it to be added.

##### Forms
- Ensure all form fields have connected labels, either through the `id` property or by nesting the form field inside the `<label>` tag.
- Ensure all form fields have the correct type set, based on their label. For example if the label is "email", the corresponding `<input>` `type` should be `email`.

##### Accessibility
- Check the HTML for accessibility.
- Check in CSS that no font size is under 16px or 1rem. Otherwise, notify the author that it is not recommended to use smaller font sizes than 16px or 1rem.
- Check that the main navigation uses the `<nav>` tag.
- Inside forms, check that the submit button is `<button type="submit">` and not a `<input type="submit">` element.
- If Font Awesome is present, i.e. there's an `<i class="fa">` or `<i class="fa-solid">` element present, check that it has the attribute `aria-hidden="true"` set, otherwise recommend the author to read up on https://fontawesome.com/v4/accessibility/.
- If there is a menu button, check that it is a `<button>` element and that it contains text, either by `aria-label` or actual text inside the element.

##### Best practices and coding conventions
- Flag any `<br>` tags, and check if they are required or if CSS could be used instead to create the spacing.
- Flag use of `<i>` and `<b>` tags.
- Flag use of any deprecated HTML tags.
- If there is a phone number present, check that the anchor tag has a `tel` prefix.
- Ensure all HTML elements are in lowercase.
- Ensure all external links have the `target="_blank"` attribute set.
- Ensure all external links declared with an `<a>` tags have security applied by having the `rel="noopener noreferrer"` attribute and attribute value present.

##### SEO
- Check that the meta tag defining an author is set.
- Check that Open Graph meta tags are defined, at least `og:title`, `og:type`, `og:url` and `og:image`.

##### Fonts
- If Google Fonts have been added, check that there are no duplicate `<link>` tags in `<head>`.

#### Image files
- Check that images follow web naming standards; no spaces, all lowercase, special characters and no international (umlaut) characters
- Notify if any image file exceeds 1 MB in size
- If the image is in PNG format, analyze if it has any transparency, otherwise recommend it to be converted to a more compressed format like JPG.
- If the image is used as a profile picture, flag if the filename is not `firstname_lastname` and mention SEO benefits of naming image files correctly.

#### CSS
- Check that the document is correctly and consistently formatted/indented.
- Flag any uses of `id` selectors
- Check that all selectors are in English
- Check that all selectors follow the same convention, like "camel case", "snake case", or "kebab case".
- If the selector is in Pascal Case, recommend to use camel case, snake case or kebab case instead.
- Check that CSS values that are zero do not have a suffix, i.e. `0px` should be `0`.
- Ensure `url()` values have quotation marks around the URL.
- Check that the CSS files contain no `@import` declarations, unless it's `@import "tailwindcss"`.
- If there is a `@import "tailwindcss"`, check that it is at line 1 of the file.
- Check that `font-size` is set in `rem` or `em`, not `px` units.
- If there is a `height` attribute set with a value that isn't `auto`, recommend using `max-height` instead to avoid cutting off or overflowing content.
- Make sure all fonts have a backup font defined.
- Ensure consistency in font size units, i.e. all font units should be either `rem` or `em` throughout all CSS/SCSS/LESS documents.
- Check for consistency in formatting in the document, i.e. that there is a space between the selector name and the curly brace. The document should not contain one selector looking like this `html, body {` (with space) and another one looking like this: `@media (max-width: 1200px){` (without space).

##### Formatting
- Check all code for correct and consistent indentation.

##### Sass/SCSS
- If SCSS/Sass has been used in the project, check that no `*.css` file has been committed. If it has been committed, recommend to add it to `.gitignore` instead.
- Check that no `*.css.map` file has been committed. If a `*.css.map` file is present, recommend it to be added to `.gitignore`.

#### README file
- Check that the `README.md` file contains some sort of description of what the repository is about, and no generic classroom assignment instructions.

#### JavaScript
- Variables should have meaningful and pronounceable variable names.
- Check that variables are declared with the same naming convention throughout the document.
- Use the same vocabulary for the same type of variable.
- Check for any un-named variables, like long numbers, and recommend them to be named constants instead.
- Function names should say what they do.
- Functions should only be one level of abstraction.
- Identify any duplicate code.
- Avoid negative conditionals.
- Identify any dead code.
- Flag any anonymous/unnamed/inline functions and recommend them to be rewritten so they are reusable.
- Code should be correctly indented.
- No CSS properties should be set directly in JavaScript, i.e. with `.style` syntax.
