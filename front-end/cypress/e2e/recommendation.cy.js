beforeEach(() => {
  cy.request("POST", "http://localhost:5000/e2e/reset", {})
})
Cypress.Commands.add("populate", () => {
  cy.request("POST", "http://localhost:5000/e2e/seed");
});

const FRONTBASE_URL = "http://localhost:3000"
const BACKBASE_URL = "http://localhost:5000/recommendations"

describe('Fluxo de criação de uma recomendação', () => {
  it("Espere criar uma recomendação", () => {
    cy.visit(`${FRONTBASE_URL}/`);

    const name = "eae fiii"
    const youtubeLink = "https://www.youtube.com/watch?v=37SwqREHRGI"

    cy.get('[data-test-id="test-input-name"]').type(name);
    cy.get('[data-test-id="test-input-youtube"]').type(youtubeLink);

    cy.intercept("POST", BACKBASE_URL).as("recommendationsPost");

    cy.get('[data-test-id="test-button-create"]').click();

    cy.wait("@recommendationsPost").then((interception) => {
      const statusCode = interception.response.statusCode;
      expect(statusCode).eq(201);
    });
  });

  it("Expect to create a repeated recommendation", () => {
    cy.visit(`${FRONTBASE_URL}/`);

    const name = "eae fiii"
    const youtubeLink = "https://www.youtube.com/watch?v=37SwqREHRGI"

    cy.get('[data-test-id="test-input-name"]').type(name);
    cy.get('[data-test-id="test-input-youtube"]').type(youtubeLink);

    cy.get('[data-test-id="test-button-create"]').click();

    cy.intercept("POST", BACKBASE_URL).as("recommendationsPost");

    cy.get('[data-test-id="test-input-name"]').type(name);
    cy.get('[data-test-id="test-input-youtube"]').type(youtubeLink);

    cy.get('[data-test-id="test-button-create"]').click();

    cy.wait("@recommendationsPost").then((interception) => {
      const statusCode = interception.response.statusCode;
      expect(statusCode).eq(409);
    });
  });
});

describe("GET /", () => {
  it("Espere retornar as últimas dez recomendações", () => {
    cy.populate();

    cy.visit(`${FRONTBASE_URL}/`);

    cy.intercept("GET", BACKBASE_URL).as("recommendations");



    cy.request("GET", BACKBASE_URL);

    cy.wait("@recommendations").then((interception) => {
      const statusCode = interception.response.statusCode;
      const body = interception.response.body.length;
      expect(body).to.be.below(11);
      expect(statusCode).eq(200);
    });
  });
});

describe("GET /top", () => {
  it("Espere retornar as dez recomendações de pontuação mais alta", () => {
    cy.visit(`${FRONTBASE_URL}/`);
    cy.populate();

    cy.intercept("GET", `${BACKBASE_URL}/top/10`).as("top-recommendations");

    cy.get('[data-test-id="test-top-recommendations"]').click();

    cy.request("GET", `${BACKBASE_URL}/top/10`);

    cy.wait("@top-recommendations").then((interception) => {
      const statusCode = interception.response.statusCode;
      const body = interception.response.body.length;
      expect(body).to.be.below(11);
      expect(statusCode).eq(200);
    });
  });
});

describe("GET /random", () => {
  it("Espere retornar as dez recomendações de pontuação mais alta", () => {
    cy.visit(`${FRONTBASE_URL}/`);
    cy.populate();

    cy.intercept("GET", `${BACKBASE_URL}/random`).as("random-recommendation");

    cy.get('[data-test-id="test-random-recommendations"]').click();

    cy.request("GET", `${BACKBASE_URL}/random`);

    cy.wait("@random-recommendation").then((interception) => {
      const statusCode = interception.response.statusCode;
      expect(statusCode).eq(200);
    });
  });
});

describe("GET /:id/upvote", () => {
  it("Espere um voto positivo na recomendação com o id enviado", () => {
    const id = 1
    cy.visit(`${FRONTBASE_URL}/top`);
    cy.populate();

    cy.intercept("POST", `${BACKBASE_URL}/${id}/upvote`).as("upvote");

    cy.get(`[data-test-id="test-upvote-${id}"]`).click();

    cy.request("POST", `${BACKBASE_URL}/${id}/upvote`);

    cy.wait("@upvote").then((interception) => {
      const statusCode = interception.response.statusCode;
      expect(statusCode).eq(200);
    });
  });

});


describe("GET /:id/downvote", () => {
  it("Espere um voto negativo na recomendação com o id enviado", () => {
    const id = 1
    cy.visit(`${FRONTBASE_URL}/top`);
    cy.populate();

    cy.intercept("POST", `${BACKBASE_URL}/${id}/downvote`).as("downvote");

    cy.get(`[data-test-id="test-downvote-${id}"]`).click();

    cy.request("POST", `${BACKBASE_URL}/${id}/downvote`);

    cy.wait("@downvote").then((interception) => {
      const statusCode = interception.response.statusCode;
      expect(statusCode).eq(200);
    });
  });
});