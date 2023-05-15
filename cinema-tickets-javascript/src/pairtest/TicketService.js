import TicketTypeRequest from './lib/TicketTypeRequest.js';
import InvalidPurchaseException from './lib/InvalidPurchaseException.js';
import TicketPaymentService from '../thirdparty/paymentgateway/TicketPaymentService.js';
import SeatReservationService from '../thirdparty/seatbooking/SeatReservationService.js';

export default class TicketService {
  paymentGateway;
  seatBookingService;

  constructor() {
    this.paymentGateway = new TicketPaymentService();
    this.seatBookingService = new SeatReservationService();
  }

  purchaseTickets(accountId, ...ticketTypeRequests) {
    this.validatePurchaseRequests(ticketTypeRequests);

    let totalAmount = 0;
    let totalSeatsToReserve = 0;

    for (const request of ticketTypeRequests) {
      const ticketType = request.getTicketType();
      const noOfTickets = request.getNoOfTickets();

      switch (ticketType) {
        case 'INFANT':
          if (noOfTickets !== 0) {
            throw new InvalidPurchaseException('Infant tickets can only have a quantity of 0');
          }
          break;
        case 'CHILD':
          totalAmount += noOfTickets * 10;
          totalSeatsToReserve += noOfTickets;
          break;
        case 'ADULT':
          totalAmount += noOfTickets * 20;
          totalSeatsToReserve += noOfTickets;
          break;
        default:
          throw new InvalidPurchaseException('Invalid ticket type');
      }
    }

    this.makePaymentRequest(accountId, totalAmount);
    this.makeSeatReservationRequest(accountId, totalSeatsToReserve);
  }

  validatePurchaseRequests(ticketTypeRequests) {
    if (ticketTypeRequests.length > 20) {
      throw new InvalidPurchaseException('Maximum of 20 tickets can be purchased at a time');
    }

    let adultTicketIncluded = false;
    let childTicketIncluded = false;
    let infantTicketIncluded = false;

    for (const request of ticketTypeRequests) {
      if (!(request instanceof TicketTypeRequest)) {
        throw new InvalidPurchaseException('Invalid ticket purchase request');
      }

      const ticketType = request.getTicketType();
      const noOfTickets = request.getNoOfTickets();

      if (ticketType === 'INFANT') {
        infantTicketIncluded = true;
      } else if (ticketType === 'CHILD') {
        if (noOfTickets === 0) {
          throw new InvalidPurchaseException('Child tickets require a quantity greater than 0');
        }
        childTicketIncluded = true;
      } else if (ticketType === 'ADULT') {
        if (noOfTickets === 0) {
          throw new InvalidPurchaseException('Adult tickets require a quantity greater than 0');
        }
        adultTicketIncluded = true;
      }
    }

    if ((childTicketIncluded || infantTicketIncluded) && !adultTicketIncluded) {
      throw new InvalidPurchaseException('Child or infant tickets cannot be purchased without an adult ticket');
    }
  }

  makePaymentRequest(accountId, amount) {
    this.paymentGateway.makePayment(accountId, amount);
  }

  makeSeatReservationRequest(accountId, quantity) {
    this.seatBookingService.reserveSeat(accountId, quantity);
  }
}
