import adminRouter from "./Admin/Admin.route.js";
import AppointmentRouter from "./Appointment/Appointment.route.js";
import authRouter from "./auth/auth.route.js";
import chatRouter from "./chat/chat.route.js";
import ContactRouter from "./contact/contact.route.js";
import DepartmentRouter from "./Department/Department.route.js";
import DoctorScheduleRouter from "./DoctorSchedule/DoctorSchedule.route.js";
import GuardianScheduleRouter from "./GuardianSchedule/GuardianSchedule.route.js";
import financialRouter from "./financialRecord/financialRecord.route.js";
import medicalReportRouter from "./medicalReport/medicalReport.route.js";
import NotificationRouter from "./Notification/Notification.route.js";
import orderRouter from "./order/order.route.js";
import pendingRouter from "./pending/pending.route.js";
import pendingAppointmentRouter from "./pendingAppointment/pendingAppointment.route.js";
import productRouter from "./product/product.route.js";
import profileRouter from "./profile/profile.route.js";
import postRouter from "./post/post.route.js";
import salesRouter from "./sales/sales.route.js";
import TreatmentPlanRouter from "./TreatmentPlan/TreatmentPlan.route.js";
import updatedProfileimage from "./UpdateImageProfile/UpdateImageProfile.route.js";
import sessionRecordRouter from "./sessionRecord/sessionRecord.route.js";
import childEvaluationRouter from "./childEvaluation/childEvaluation.route.js";


export{
    authRouter,
    pendingRouter,
    adminRouter,
    AppointmentRouter,
    pendingAppointmentRouter,
    productRouter,
    orderRouter,
    financialRouter,
    salesRouter,
    medicalReportRouter,
    profileRouter,
    ContactRouter,
    updatedProfileimage,
    chatRouter,
    NotificationRouter,
    TreatmentPlanRouter,
    DoctorScheduleRouter,
    DepartmentRouter,
    GuardianScheduleRouter,
    sessionRecordRouter,
    childEvaluationRouter,
    postRouter
 
}
