import TicketService from '../src/pairtest/TicketService.js';
import TicketTypeRequest from '../src/pairtest/lib/TicketTypeRequest.js';
import InvalidPurchaseException from '../src/pairtest/lib/InvalidPurchaseException.js';
import TicketPaymentService from '../src/thirdparty/paymentgateway/TicketPaymentService.js';
import SeatReservationService from '../src/thirdparty/seatbooking/SeatReservationService.js';

describe('TicketService', () => {
  let ticketService;
  let paymentService;

  beforeEach(() => {
    ticketService = new TicketService();
    paymentService = new TicketPaymentService();
    ticketService.paymentGateway = paymentService;
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

    it('should reject infant ticket requests with non-zero quantity', () => {
      const infantTicketRequest = new TicketTypeRequest('INFANT', 1);
      expect(() => ticketService.purchaseTickets(1, infantTicketRequest))
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

  describe('makePayment', () => {
    it('should make a payment request with the correct account ID and amount', () => {
      const accountId = 123;
      const adultTicketRequest = new TicketTypeRequest('ADULT', 2);
      const ticketRequests = [adultTicketRequest];
      const pricePerTicket = 20;
      const expectedAmount = adultTicketRequest.getNoOfTickets() * pricePerTicket;
  
      const paymentRequestMock = jest.fn();
      paymentService.makePayment = paymentRequestMock;
  
      ticketService.purchaseTickets(accountId, ...ticketRequests);
  
      expect(paymentRequestMock).toHaveBeenCalledWith(accountId, expectedAmount);
    });
  });

  describe('Third Party Services', () => {
    describe('TicketPaymentService', () => {
      it('should throw error if accountId is not integer', () => {
        expect(() => paymentService.makePayment('test', 10)).toThrow(TypeError);
      });
  
      it('should throw error if totalAmountToPay is not integer', () => {
        expect(() => paymentService.makePayment(1, 'test')).toThrow(TypeError);
      });
  
      it('should not throw error if inputs are valid', () => {
        expect(() => paymentService.makePayment(1, 10)).not.toThrow();
      });
    });
  
    describe('SeatReservationService', () => {
      let reservationService;
  
      beforeEach(() => {
        reservationService = new SeatReservationService();
      });
  
      it('should throw error if accountId is not integer', () => {
        expect(() => reservationService.reserveSeat('test', 5)).toThrow(TypeError);
      });
  
      it('should throw error if totalSeatsToAllocate is not integer', () => {
        expect(() => reservationService.reserveSeat(1, 'test')).toThrow(TypeError);
      });
  
      it('should not throw error if inputs are valid', () => {
        expect(() => reservationService.reserveSeat(1, 5)).not.toThrow();
      });
    });
  });

});
