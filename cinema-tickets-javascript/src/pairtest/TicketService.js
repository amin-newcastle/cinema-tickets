import TicketTypeRequest from './lib/TicketTypeRequest.js';
import InvalidPurchaseException from './lib/InvalidPurchaseException.js';
import TicketPaymentService from '../thirdparty/paymentgateway/TicketPaymentService.js';
import SeatReservationService from '../thirdparty/seatbooking/SeatReservationService.js';

export default class TicketService {
  /**
   * Should only have private methods other than the one below.
   */

  paymentGateway = new TicketPaymentService();
  seatBookingService = new SeatReservationService();

  purchaseTickets(accountId, ...ticketTypeRequests) {
    // Check if the purchase request exceeds the maximum number of tickets
    if (ticketTypeRequests.length > 20) {
      throw new InvalidPurchaseException('Maximum of 20 tickets can be purchased at a time');
    }

    // Validate the ticket purchase requests
    for (const request of ticketTypeRequests) {
      if (!(request instanceof TicketTypeRequest)) {
        throw new InvalidPurchaseException('Invalid ticket purchase request');
      }
    }

    // Calculate the total amount for requested tickets
    let totalAmount = 0;
    for (const request of ticketTypeRequests) {
      const ticketType = request.getTicketType();
      const noOfTickets = request.getNoOfTickets();

      switch (ticketType) {
        case 'INFANT':
          // Infants do not pay for a ticket
          break;
        case 'CHILD':
          totalAmount += noOfTickets * 10;
          break;
        case 'ADULT':
          totalAmount += noOfTickets * 20;
          break;
        default:
          throw new InvalidPurchaseException('Invalid ticket type');
      }
    }

    // Make a payment request to the TicketPaymentService
    this.paymentGateway.makePayment(accountId, totalAmount);

    // Calculate the total number of seats to reserve
    let totalSeatsToReserve = 0;
    for (const request of ticketTypeRequests) {
      if (request.getTicketType() !== 'INFANT') {
        totalSeatsToReserve += request.getNoOfTickets();
      }
    }

    // Make a seat reservation request to the SeatReservationService
    this.seatBookingService.reserveSeat(accountId, totalSeatsToReserve);

    // TODO: Implement the rest of the purchaseTickets method
  }
}
