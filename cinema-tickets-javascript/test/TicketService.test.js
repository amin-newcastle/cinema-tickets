import TicketService from '../src/TicketService.js';
import TicketTypeRequest from '../src/pairtest/lib/TicketTypeRequest.js';
import InvalidPurchaseException from '../src/pairtest/lib/InvalidPurchaseException.js';

describe('TicketService', () => {
  let ticketService;

  beforeEach(() => {
    ticketService = new TicketService();
  });

  it('should calculate the correct amount for requested tickets and make a payment request', () => {
    const paymentMock = jest.fn();
    const paymentGatewayMock = {
      makePayment: paymentMock,
    };

    // Mocking the payment gateway
    ticketService.paymentGateway = paymentGatewayMock;

    // Define the ticket purchase requests
    const ticketRequests = [
      new TicketTypeRequest('ADULT', 2),
      new TicketTypeRequest('CHILD', 3),
    ];

    // Call the purchaseTickets method
    ticketService.purchaseTickets(1, ...ticketRequests);

    // Verify the payment request
    expect(paymentMock).toHaveBeenCalledWith(1, 70); // Total amount = 2 * 20 (ADULT) + 3 * 10 (CHILD) = 70
  });

  it('should calculate the correct number of seats to reserve and make a seat reservation request', () => {
    const reservationMock = jest.fn();
    const seatBookingMock = {
      reserveSeat: reservationMock,
    };

    // Mocking the seat booking service
    ticketService.seatBookingService = seatBookingMock;

    // Define the ticket purchase requests
    const ticketRequests = [
      new TicketTypeRequest('ADULT', 2),
      new TicketTypeRequest('CHILD', 3),
    ];

    // Call the purchaseTickets method
    ticketService.purchaseTickets(1, ...ticketRequests);

    // Verify the seat reservation request
    expect(reservationMock).toHaveBeenCalledWith(1, 5); // Total seats to allocate = 2 (ADULT) + 3 (CHILD) = 5
  });

  it('should reject invalid ticket purchase requests', () => {
    // Define an invalid ticket purchase request (missing ADULT ticket)
    const invalidRequest = new TicketTypeRequest('CHILD', 2);

    // Call the purchaseTickets method with invalid request
    expect(() => {
      ticketService.purchaseTickets(1, invalidRequest);
    }).toThrow(InvalidPurchaseException);

    // Define a valid ticket purchase request
    const validRequest = new TicketTypeRequest('ADULT', 2);

    // Call the purchaseTickets method with valid request
    expect(() => {
      ticketService.purchaseTickets(1, validRequest);
    }).not.toThrow(InvalidPurchaseException);
  });
});
