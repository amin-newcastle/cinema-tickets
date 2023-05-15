import TicketService from '../src/pairtest/TicketService';
import TicketTypeRequest from '../src/pairtest/lib/TicketTypeRequest.js';
import InvalidPurchaseException from '../src/pairtest/lib/InvalidPurchaseException.js';

describe('TicketService', () => {
  let ticketService;

  beforeEach(() => {
    ticketService = new TicketService();
  });

  it('should calculate the correct amount for requested tickets and make a payment request', () => {
    // TODO: Write the test case for calculating the amount and making a payment request
  });

  it('should calculate the correct number of seats to reserve and make a seat reservation request', () => {
    // TODO: Write the test case for calculating the number of seats and making a reservation request
  });

  it('should reject invalid ticket purchase requests', () => {
    // TODO: Write the test case for rejecting invalid purchase requests
  });
  
});
