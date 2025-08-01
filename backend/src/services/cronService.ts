import cron from 'node-cron';
import { PrismaClient } from '@prisma/client';
import { addDays, isBefore } from 'date-fns';
import { sendNotificationEmail } from './emailService';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

export function startCronJobs() {
  // Check for expiring documents every day at 9 AM
  cron.schedule('0 9 * * *', async () => {
    logger.info('Running daily notification check');
    await checkExpiringDocuments();
    await checkExpiringInsurance();
    await checkUpcomingServices();
    await checkLeaseExpiry();
  });
}

async function checkExpiringDocuments() {
  try {
    const thirtyDaysFromNow = addDays(new Date(), 30);
    
    const expiringDocs = await prisma.document.findMany({
      where: {
        expiryDate: {
          lte: thirtyDaysFromNow,
          gte: new Date()
        },
        reminderSent: false
      },
      include: {
        vehicle: {
          include: {
            organization: {
              include: {
                users: {
                  where: {
                    role: {
                      in: ['ADMIN', 'FLEET_MANAGER']
                    }
                  }
                }
              }
            }
          }
        }
      }
    });

    for (const doc of expiringDocs) {
      const daysUntilExpiry = Math.ceil(
        (doc.expiryDate!.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
      );

      for (const user of doc.vehicle.organization.users) {
        await sendNotificationEmail({
          to: user.email,
          subject: `Document Expiring Soon - ${doc.vehicle.plateNumber}`,
          html: `
            <h2>Document Expiry Notification</h2>
            <p>The ${doc.type} for vehicle ${doc.vehicle.make} ${doc.vehicle.model} (${doc.vehicle.plateNumber}) will expire in ${daysUntilExpiry} days.</p>
            <p><strong>Document:</strong> ${doc.name}</p>
            <p><strong>Expiry Date:</strong> ${doc.expiryDate?.toLocaleDateString()}</p>
            <p>Please renew the document before the expiry date.</p>
          `
        });
      }

      await prisma.document.update({
        where: { id: doc.id },
        data: { 
          reminderSent: true,
          reminderDate: new Date()
        }
      });

      await prisma.notificationLog.create({
        data: {
          type: 'DOCUMENT_EXPIRY',
          recipientEmail: doc.vehicle.organization.users.map(u => u.email).join(', '),
          subject: `Document Expiring Soon - ${doc.vehicle.plateNumber}`,
          message: `${doc.type} expiring in ${daysUntilExpiry} days`,
          vehicleId: doc.vehicleId,
          documentId: doc.id,
          status: 'sent'
        }
      });
    }
  } catch (error) {
    logger.error('Error checking expiring documents:', error);
  }
}

async function checkExpiringInsurance() {
  try {
    const thirtyDaysFromNow = addDays(new Date(), 30);
    
    const expiringPolicies = await prisma.insurancePolicy.findMany({
      where: {
        endDate: {
          lte: thirtyDaysFromNow,
          gte: new Date()
        },
        reminderSent: false
      },
      include: {
        vehicle: {
          include: {
            organization: {
              include: {
                users: {
                  where: {
                    role: {
                      in: ['ADMIN', 'FLEET_MANAGER', 'ACCOUNTANT']
                    }
                  }
                }
              }
            }
          }
        }
      }
    });

    for (const policy of expiringPolicies) {
      const daysUntilExpiry = Math.ceil(
        (policy.endDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
      );

      for (const user of policy.vehicle.organization.users) {
        await sendNotificationEmail({
          to: user.email,
          subject: `Insurance Policy Expiring - ${policy.vehicle.plateNumber}`,
          html: `
            <h2>Insurance Expiry Notification</h2>
            <p>The insurance policy for vehicle ${policy.vehicle.make} ${policy.vehicle.model} (${policy.vehicle.plateNumber}) will expire in ${daysUntilExpiry} days.</p>
            <p><strong>Policy Number:</strong> ${policy.policyNumber}</p>
            <p><strong>Provider:</strong> ${policy.provider}</p>
            <p><strong>Expiry Date:</strong> ${policy.endDate.toLocaleDateString()}</p>
            <p>Please renew the insurance policy before it expires.</p>
          `
        });
      }

      await prisma.insurancePolicy.update({
        where: { id: policy.id },
        data: { reminderSent: true }
      });
    }
  } catch (error) {
    logger.error('Error checking expiring insurance:', error);
  }
}

async function checkUpcomingServices() {
  try {
    const vehicles = await prisma.vehicle.findMany({
      where: {
        status: 'ACTIVE'
      },
      include: {
        maintenanceRecords: {
          orderBy: {
            performedDate: 'desc'
          },
          take: 1
        },
        organization: {
          include: {
            users: {
              where: {
                role: {
                  in: ['ADMIN', 'FLEET_MANAGER']
                }
              }
            }
          }
        },
        assignments: {
          where: {
            isActive: true
          },
          include: {
            driver: {
              include: {
                user: true
              }
            }
          }
        }
      }
    });

    for (const vehicle of vehicles) {
      const lastService = vehicle.maintenanceRecords[0];
      if (!lastService || !lastService.nextDueKm) continue;

      const kmUntilService = lastService.nextDueKm - vehicle.mileage;
      
      // Notify if less than 500km until service
      if (kmUntilService > 0 && kmUntilService <= 500) {
        const recipients = [
          ...vehicle.organization.users.map(u => u.email),
          ...vehicle.assignments.map(a => a.driver.user.email)
        ];

        for (const email of [...new Set(recipients)]) {
          await sendNotificationEmail({
            to: email,
            subject: `Service Due Soon - ${vehicle.plateNumber}`,
            html: `
              <h2>Vehicle Service Reminder</h2>
              <p>Vehicle ${vehicle.make} ${vehicle.model} (${vehicle.plateNumber}) needs service soon.</p>
              <p><strong>Current Mileage:</strong> ${vehicle.mileage} km</p>
              <p><strong>Service Due At:</strong> ${lastService.nextDueKm} km</p>
              <p><strong>Remaining:</strong> ${kmUntilService} km</p>
              <p>Please schedule the service appointment.</p>
            `
          });
        }
      }
    }
  } catch (error) {
    logger.error('Error checking upcoming services:', error);
  }
}

async function checkLeaseExpiry() {
  try {
    const sixtyDaysFromNow = addDays(new Date(), 60);
    
    const expiringLeases = await prisma.leaseContract.findMany({
      where: {
        endDate: {
          lte: sixtyDaysFromNow,
          gte: new Date()
        }
      },
      include: {
        vehicle: {
          include: {
            organization: {
              include: {
                users: {
                  where: {
                    role: {
                      in: ['ADMIN', 'FLEET_MANAGER', 'ACCOUNTANT']
                    }
                  }
                }
              }
            }
          }
        }
      }
    });

    for (const lease of expiringLeases) {
      const daysUntilExpiry = Math.ceil(
        (lease.endDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
      );

      for (const user of lease.vehicle.organization.users) {
        await sendNotificationEmail({
          to: user.email,
          subject: `Lease Contract Ending - ${lease.vehicle.plateNumber}`,
          html: `
            <h2>Lease Expiry Notification</h2>
            <p>The lease contract for vehicle ${lease.vehicle.make} ${lease.vehicle.model} (${lease.vehicle.plateNumber}) will end in ${daysUntilExpiry} days.</p>
            <p><strong>Leasing Company:</strong> ${lease.leasingCompany}</p>
            <p><strong>Contract Number:</strong> ${lease.contractNumber}</p>
            <p><strong>End Date:</strong> ${lease.endDate.toLocaleDateString()}</p>
            <p>Please contact the leasing company to discuss renewal or return options.</p>
          `
        });
      }
    }
  } catch (error) {
    logger.error('Error checking lease expiry:', error);
  }
}