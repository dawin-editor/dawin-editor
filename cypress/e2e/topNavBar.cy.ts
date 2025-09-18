describe("template spec", () => {
  beforeEach(() => {
    cy.visit("http://localhost:5173/");
    cy.get('[aria-label="قائمة التصدير"]').click();
  });

  it("should open import export menu", () => {
    cy.get('[data-cy="export-dropdown-menu"]')
      .children()
      .should("have.length", 3);
  });

  it("should upload file", () => {
    cy.get('[data-cy="upload-file"] label').click();
    cy.get('[data-cy="upload-file-input"]').selectFile(
      "cypress/fixtures/example.md",
      { force: true }
    );
  });

  it("should export HTML", () => {
    cy.get('[class="tiptap ProseMirror simple-editor"]')
      .clear({ force: true })
      .type("# Hello", {
        force: true,
      });
    cy.get('[aria-label="قائمة التصدير"]').click();
    cy.get('[data-cy="export-html"]').click();
    cy.get('[data-cy="download-button"]').click();
    cy.readFile("cypress/downloads/مستند بدون عنوان.html").should("contain", "<h1>Hello</h1>");
  });

  it("should export Markdown", () => {
    cy.get('[class="tiptap ProseMirror simple-editor"]')
      .clear({ force: true })
      .type("# Hello", {
        force: true,
      });
    cy.get('[aria-label="قائمة التصدير"]').click();
    cy.get('[data-cy="export-markdown"]').click();
    cy.get('[data-cy="download-button"]').click();
    cy.readFile("cypress/downloads/مستند بدون عنوان.md").should(
      "contain",
      "# Hello"
    );
  });
});
