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
    it('should reject ticket purchase requests exceeding maximum limit', () => {
      const ticketRequests = Array(21).fill(new TicketTypeRequest('ADULT', 1));
      expect(() => ticketService.purchaseTickets(1, ...ticketRequests))
        .toThrow(InvalidPurchaseException);
    });

    it('should reject ticket purchase requests with child or infant tickets but without an adult ticket', () => {
      const childTicketRequest = new TicketTypeRequest('CHILD', 1);
      const infantTicketRequest = new TicketTypeRequest('INFANT', 1);
      expect(() => ticketService.purchaseTickets(1, childTicketRequest))
        .toThrow(InvalidPurchaseException);
      expect(() => ticketService.purchaseTickets(1, infantTicketRequest))
        .toThrow(InvalidPurchaseException);
    });
  });

  describe('Validate Purchase Requests', () => {
    it('should throw error when invalid request is passed', () => {
      const invalidRequest = { getTicketType: () => 'ADULT', getNoOfTickets: () => 1 };
      expect(() => ticketService.purchaseTickets(1, invalidRequest)).toThrow(InvalidPurchaseException);
    });

    it('should throw error when infant ticket has non-zero quantity', () => {
      const adultTicketRequest = new TicketTypeRequest('ADULT', 1);
      const infantTicketRequest = new TicketTypeRequest('INFANT', 1);
      expect(() => ticketService.purchaseTickets(1, adultTicketRequest, infantTicketRequest)).toThrow(InvalidPurchaseException);
    });
  });

  describe('Ticket quantity validations', () => {
    it('should reject adult or child ticket requests with 0 quantity', () => {
      const adultTicketRequest = new TicketTypeRequest('ADULT', 0);
      const childTicketRequest = new TicketTypeRequest('CHILD', 0);
      expect(() => ticketService.purchaseTickets(1, adultTicketRequest))
        .toThrow(InvalidPurchaseException);
      expect(() => ticketService.purchaseTickets(1, childTicketRequest))
        .toThrow(InvalidPurchaseException);
    });

    it('should reject infant ticket requests with non-zero quantity', () => {
      const infantTicketRequest = new TicketTypeRequest('INFANT', 1);
      expect(() => ticketService.purchaseTickets(1, infantTicketRequest))
        .toThrow(InvalidPurchaseException);
    });
  });

  describe('Validate accountId', () => {
    const ticketTypeRequest = new TicketTypeRequest('ADULT', 1);
    it('throws InvalidPurchaseException if accountId is less than or equal to 0', () => {
      expect(() => {
        ticketService.purchaseTickets(0, ticketTypeRequest);
      }).toThrow(InvalidPurchaseException);
    });
  
    it('does not throw InvalidPurchaseException if accountId is a positive number', () => {
      expect(() => {
        ticketService.purchaseTickets(1, ticketTypeRequest);
      }).not.toThrow(InvalidPurchaseException);
    });
  });
});

describe('Third Party Services', () => {
  let ticketService;
  let paymentService;

  beforeEach(() => {
    ticketService = new TicketService();
    paymentService = new TicketPaymentService();
    ticketService.paymentGateway = paymentService;
  });

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

describe('TicketTypeRequest', () => {
  describe('constructor', () => {
    it('should reject invalid ticket type', () => {
      expect(() => new TicketTypeRequest('INVALID_TYPE', 1)).toThrow(TypeError);
    });

    it('should reject non-integer ticket quantity', () => {
      expect(() => new TicketTypeRequest('ADULT', 'one')).toThrow(TypeError);
    });

    it('should not throw error if inputs are valid', () => {
      expect(() => new TicketTypeRequest('ADULT', 1)).not.toThrow();
    });
  });

  describe('getNoOfTickets', () => {
    it('should return the correct number of tickets', () => {
      const request = new TicketTypeRequest('ADULT', 5);
      expect(request.getNoOfTickets()).toBe(5);
    });
  });

  describe('getTicketType', () => {
    it('should return the correct ticket type', () => {
      const request = new TicketTypeRequest('ADULT', 5);
      expect(request.getTicketType()).toBe('ADULT');
    });
  });
});
