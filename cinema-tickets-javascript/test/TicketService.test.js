import TicketService from '../src/pairtest/TicketService.js';
import TicketTypeRequest from '../src/pairtest/lib/TicketTypeRequest.js';
import InvalidPurchaseException from '../src/pairtest/lib/InvalidPurchaseException.js';

describe('TicketService', () => {
  let ticketService;

  beforeEach(() => {
    ticketService = new TicketService();
  });

  describe('Payment and reservation calculations', () => {
    const ticketRequests = [
      new TicketTypeRequest('ADULT', 2),
      new TicketTypeRequest('CHILD', 3),
    ];

    it('should calculate the correct amount for requested tickets and make a payment request', () => {
      const paymentMock = jest.fn();
      ticketService.paymentGateway = { makePayment: paymentMock };
      ticketService.purchaseTickets(1, ...ticketRequests);
      expect(paymentMock).toHaveBeenCalledWith(1, 70); // 2 * 20 (ADULT) + 3 * 10 (CHILD) = 70
    });

    it('should calculate the correct number of seats to reserve and make a seat reservation request', () => {
      const reservationMock = jest.fn();
      ticketService.seatBookingService = { reserveSeat: reservationMock };
      ticketService.purchaseTickets(1, ...ticketRequests);
      expect(reservationMock).toHaveBeenCalledWith(1, 5); // 2 (ADULT) + 3 (CHILD) = 5
    });
  });

  describe('Ticket purchase validations', () => {
    it('should reject invalid ticket purchase requests', () => {
      const invalidRequest = new TicketTypeRequest('CHILD', 2);
      expect(() => ticketService.purchaseTickets(1, invalidRequest))
        .toThrow(InvalidPurchaseException);
    });

    it('should reject ticket purchase requests exceeding maximum limit', () => {
      const ticketRequests = Array(21).fill(new TicketTypeRequest('ADULT', 1));
      expect(() => ticketService.purchaseTickets(1, ...ticketRequests))
        .toThrow(InvalidPurchaseException);
    });

    it('should reject ticket purchase requests with child or infant tickets but without an adult ticket', () => {
      const childTicketRequest = new TicketTypeRequest('CHILD', 1);
      const infantTicketRequest = new TicketTypeRequest('INFANT', 0);
      expect(() => ticketService.purchaseTickets(1, childTicketRequest))
        .toThrow(InvalidPurchaseException);
      expect(() => ticketService.purchaseTickets(1, infantTicketRequest))
        .toThrow(InvalidPurchaseException);
    });
  });

  describe('Ticket quantity validations', () => {
    it('should reject adult ticket requests with 0 quantity', () => {
      const adultTicketRequest = new TicketTypeRequest('ADULT', 0);
      expect(() => ticketService.purchaseTickets(1, adultTicketRequest))
        .toThrow(InvalidPurchaseException);
    });

    it('should reject infant ticket requests with non-zero quantity', () => {
      const infantTicketRequest = new TicketTypeRequest('INFANT', 1);
      expect(() => ticketService.purchaseTickets(1, infantTicketRequest))
        .toThrow(InvalidPurchaseException);
    });

    it('should reject child ticket requests with 0 quantity', () => {
      const childTicketRequest = new TicketTypeRequest('CHILD', 0);
      expect(() => ticketService.purchaseTickets(1, childTicketRequest))
      .toThrow(InvalidPurchaseException);
    });
  });

  describe('TicketTypeRequest class', () => {
    it('should return the correct number of tickets and ticket type', () => {
      const request = new TicketTypeRequest('ADULT', 5);
      expect(request.getNoOfTickets()).toBe(5);
      expect(request.getTicketType()).toBe('ADULT');
    });
  });
});
