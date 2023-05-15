import TicketTypeRequest from './lib/TicketTypeRequest.js';
import InvalidPurchaseException from './lib/InvalidPurchaseException.js';
import TicketPaymentService from '../thirdparty/paymentgateway/TicketPaymentService.js';
import SeatReservationService from '../thirdparty/seatbooking/SeatReservationService.js';

export default class TicketService {
  paymentGateway = new TicketPaymentService();
  seatBookingService = new SeatReservationService();

  purchaseTickets(accountId, ...ticketTypeRequests) {
    // Check if the purchase request exceeds the maximum number of tickets
    if (ticketTypeRequests.length > 20) {
      throw new InvalidPurchaseException('Maximum of 20 tickets can be purchased at a time');
    }

    // Validate the ticket purchase requests
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

    // Check if child or infant tickets are purchased without an adult ticket
    if ((childTicketIncluded || infantTicketIncluded) && !adultTicketIncluded) {
      throw new InvalidPurchaseException('Child or infant tickets cannot be purchased without an adult ticket');
    }

    // Calculate the total amount for requested tickets
    let totalAmount = 0;
    let totalSeatsToReserve = 0; // New variable to track seat reservation

    for (const request of ticketTypeRequests) {
      const ticketType = request.getTicketType();
      const noOfTickets = request.getNoOfTickets();

      switch (ticketType) {
        case 'INFANT':
          // Infants do not pay for a ticket
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

    // Make a payment request to the TicketPaymentService
    this.paymentGateway.makePayment(accountId, totalAmount);

    // Make a seat reservation request to the SeatReservationService
    this.seatBookingService.reserveSeat(accountId, totalSeatsToReserve);
  }
}
