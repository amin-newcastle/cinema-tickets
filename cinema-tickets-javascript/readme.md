# Cinema Tickets JavaScript Project

This project is a coding exercise that demonstrates the implementation of a ticket service for a cinema. The ticket service handles the calculation of ticket prices, payment processing, and seat reservation. The project adheres to TDD (Test-Driven Development) and follows Robert C. Martin's clean code principles.

## Objective

The objective of this project is to implement a `TicketService` class that meets the specified business rules and constraints. The `TicketService` is responsible for calculating the correct amount for the requested tickets, making a payment request to the `TicketPaymentService`, and reserving seats through the `SeatReservationService`. The implementation should reject any invalid ticket purchase requests and ensure proper validations are in place.

## Business Rules

- There are three types of tickets: Infant, Child, and Adult.
- Each ticket type has a specific price.
- The ticket purchaser declares the number and type of tickets they want to buy.
- Multiple tickets can be purchased at once, up to a maximum of 20.
- Infants do not pay for a ticket and do not have allocated seats.
- Child and Infant tickets cannot be purchased without an Adult ticket.
- The `TicketPaymentService` handles payment processing.
- The `SeatReservationService` handles seat reservation.

## Constraints

- The code in the `thirdparty` packages cannot be modified.
- The `TicketTypeRequest` should be an immutable object.

## Project Structure

The project is organized into the following folders:

- `src`: Contains the source code files.
  - `pairtest`: Contains the implementation of the `TicketService` class and supporting files.
  - `thirdparty`: Contains the third-party service implementations.
- `test`: Contains the unit tests for the `TicketService` class.

## Installation

To run the project and execute the tests, follow these steps:

1. Clone the repository to your local machine.
2. Install the dependencies by running `npm install` in the project root directory.
3. Run the tests by executing the command `npm test`.

## Files and Classes

- `TicketService.js`: Implements the `TicketService` class responsible for ticket calculations, payment requests, and seat reservations.
- `TicketTypeRequest.js`: Defines the `TicketTypeRequest` class as an immutable object representing a ticket purchase request.
- `InvalidPurchaseException.js`: Defines the `InvalidPurchaseException` class for handling invalid ticket purchase requests.
- `TicketPaymentService.js`: Represents the external service responsible for payment processing.
- `SeatReservationService.js`: Represents the external service responsible for seat reservation.

## Testing

The project includes comprehensive unit tests to verify the functionality of the `TicketService` class and ensure that the business rules and constraints are met. The tests cover different scenarios and edge cases to provide maximum coverage and validate the implementation. The tests can be executed by running `npm test`.

## Assumptions

The project makes the following assumptions:

- All accounts with an ID greater than zero are considered valid and have sufficient funds for ticket purchases.
- The payment and seat reservation services are external providers with no defects.
- The payment will always go through once a payment request is made to the `TicketPaymentService`.
- The seat reservation will always be successful once a reservation request is made to the `SeatReservationService`.

## Conclusion

The Cinema Tickets JavaScript project demonstrates the implementation of a ticket service for a cinema. It includes a well-tested `TicketService` class that handles ticket calculations, payment processing, and seat reservations. The project follows TDD principles and adheres to clean code practices.