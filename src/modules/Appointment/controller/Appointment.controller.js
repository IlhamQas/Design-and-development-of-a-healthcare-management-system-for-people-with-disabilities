import { appointmentModel } from "../../../../DB/models/appointment.model.js";
import { pendingAppointmentModel } from "../../../../DB/models/pendingAppointment.model.js";
import { userModel } from "../../../../DB/models/user.model.js";
import { sendEmail } from "../../../Servicess/email.js";

export const addAppointment = async (req, res) => {
  const { name, date, notes, email, phonenumber } = req.body;

  try {
    const addNewAppointment = new pendingAppointmentModel({
      name,
      date,
      notes,
      email,
      phonenumber,
    });

    const save = await addNewAppointment.save();

    const baseUrl = `${req.protocol}://${req.headers.host}`;
    const cancelLink = `${baseUrl}/api/v1/appointment/cancel/${addNewAppointment._id}`;
    const rescheduleLink = `${baseUrl}/api/v1/appointment/reschedule-form/${addNewAppointment._id}`;

    const message = `
      <!DOCTYPE html>
      <html>
      <head>
          <meta charset="utf-8">
          <title>Appointment Confirmation</title>
      </head>
      <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
          <div style="background-color: #fff; padding: 20px; border-radius: 10px;">
              <h2 style="color: #4CAF50;">Appointment Successfully Scheduled</h2>
              <p>Your appointment is scheduled for: <strong>${date}</strong></p>
              <p>Notes: ${notes || "No notes provided."}</p>
              <p>You can manage your appointment using the links below <strong>until it is approved by the manager</strong>. Once approved, modifications will no longer be allowed.</p>
              <a href="${cancelLink}" style="display:inline-block; margin: 10px; padding: 10px 20px; background-color: #D32F2F; color: #fff; text-decoration: none; border-radius: 5px;">Cancel Appointment</a>
              <a href="${rescheduleLink}" style="display:inline-block; margin: 10px; padding: 10px 20px; background-color: #1976D2; color: #fff; text-decoration: none; border-radius: 5px;">Reschedule Appointment</a>

          </div>
      </body>
      </html>
    `;

    await sendEmail(email, "Appointment Confirmation", message);

    return res.status(200).json({ message: "Appointment saved and email sent successfully", save });

  } catch (error) {
    return res.status(500).json({ message: `Error: ${error.message}` });
  }
};

export const getAllAppointments = async (req, res) => {
  try {
    const appointments = await pendingAppointmentModel.find();

    if (appointments.length === 0) {
      return res.status(200).json({ message: "No appointments found" });
    }

    return res.status(200).json(appointments);
  } catch (error) {
    return res.status(500).json({ message: `Error fetching appointments: ${error.message}` });
  }
};


export const cancelPendingAppointment = async (req, res) => {
  try {
    const { id } = req.params;

    const appointment = await pendingAppointmentModel.findById(id);
    if (!appointment) {
      return res.status(404).send("<h2>Appointment not found</h2>");
    }

    const userEmail = appointment.email;
    const userName = appointment.name;
    const appointmentDate = appointment.date;

    await appointment.deleteOne();

    const cancelMessage = `
      <!DOCTYPE html>
      <html>
      <head>
          <meta charset="utf-8">
          <title>Appointment Cancelled</title>
      </head>
      <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
          <div style="background-color: #fff; padding: 20px; border-radius: 10px;">
              <h2 style="color: #D32F2F;">Appointment Cancelled</h2>
              <p>Dear ${userName},</p>
              <p>Your appointment scheduled for <strong>${appointmentDate}</strong> has been successfully cancelled.</p>
              <p>If this was a mistake, please create a new appointment through our platform.</p>
              <br/>
              <p style="color: #555;">Thank you.</p>
          </div>
      </body>
      </html>
    `;

    await sendEmail(userEmail, "Appointment Cancelled", cancelMessage);

    return res.send(`
      <h2>Appointment cancelled successfully</h2>
      <p>Your appointment has been cancelled and a confirmation email has been sent.</p>
      <a href="/">Return to Home</a>
    `);
  } catch (error) {
    return res.status(500).send(`<h2>Error cancelling appointment: ${error.message}</h2>`);
  }
};





export const renderRescheduleForm = async (req, res) => {
  try {
    const { id } = req.params;
    const appointment = await pendingAppointmentModel.findById(id);

    if (!appointment) {
      return res.status(404).send("<h2>Appointment not found</h2>");
    }

    return res.send(`
      <html>
      <head>
        <title>Reschedule Appointment</title>
      </head>
      <body style="font-family: Arial; padding: 20px;">
        <h2>Reschedule Your Appointment</h2>
        <form action="/api/v1/appointment/reschedule/${id}" method="POST">
          <label>New Date:</label><br/>
          <input type="datetime-local" name="newDate" required style="padding: 5px; margin: 10px 0;"><br/>
          <button type="submit" style="padding: 10px 20px;">Submit</button>
        </form>
      </body>
      </html>
    `);
  } catch (error) {
    return res.status(500).send(`<h2>Error: ${error.message}</h2>`);
  }
};



export const rescheduleFromForm = async (req, res) => {
  try {
    const { id } = req.params;
    const { newDate } = req.body;

    const appointment = await pendingAppointmentModel.findById(id);
    if (!appointment) {
      return res.status(404).send("<h2>Appointment not found</h2>");
    }

    const oldDate = appointment.date;
    appointment.date = newDate;
    await appointment.save();

    const emailMessage = `
      <h2>Appointment Rescheduled</h2>
      <p>Hello ${appointment.name},</p>
      <p>Your appointment has been changed from <strong>${oldDate}</strong> to <strong>${newDate}</strong>.</p>
    `;

    await sendEmail(appointment.email, "Appointment Rescheduled", emailMessage);

    return res.send(`
      <h2>Appointment Updated</h2>
      <p>Your appointment has been successfully rescheduled. An email confirmation was sent.</p>
    `);
  } catch (error) {
    return res.status(500).send(`<h2>Error: ${error.message}</h2>`);
  }
};



export const requestModificationOrCancellation = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { newDate, newNotes, isDelete } = req.body;
    const appointment = await appointmentModel.findById(appointmentId);

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    if (isDelete) {
      appointment.modifiedRequest = true;
      appointment.status = 'pending';
    } else {
      if (newDate) appointment.modifiedDate = newDate;
      if (newNotes) appointment.notes = newNotes;
      appointment.modifiedRequest = true;
      appointment.status = 'pending';
    }

    await appointment.save();

    const managers = await userModel.find({ role: 'manager' });

    if (managers.length > 0) {
      const subject = "New Appointment Modification or Cancellation Request";
      const text = `A new request has been made for appointment ID ${appointmentId}.
      Please review the changes or cancellation request and approve or reject the request.`;

      managers.forEach(manager => {
        sendEmail(manager.email, subject, text);
      });
    }

    return res.status(200).json({ message: "Request is pending", appointment });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};



export const manageModificationOrCancellationRequest = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { isAccepted, isDelete } = req.body;

    const appointment = await appointmentModel.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    if (!appointment.modifiedRequest) {
      return res.status(400).json({ message: "No modification or cancellation request found for this appointment" });
    }

    if (isAccepted) {
      if (isDelete) {
        await appointment.remove();
        sendEmail(appointment.guardianId, "Your appointment has been deleted successfully");
        return res.status(200).json({ message: "Appointment deleted successfully", appointment });
      } else {
        appointment.status = 'approved';
        appointment.modifiedRequest = false;
        appointment.date = appointment.modifiedDate;
        await appointment.save();
        sendEmail(appointment.guardianId, "Your appointment modification has been approved");
        return res.status(200).json({ message: "Appointment modified successfully", appointment });
      }
    } else {
      appointment.status = 'cancelled';
      appointment.modifiedRequest = false;
      await appointment.save();
      sendEmail(appointment.guardianId, "Your appointment modification or cancellation request has been rejected");
      return res.status(200).json({ message: "Request rejected", appointment });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
