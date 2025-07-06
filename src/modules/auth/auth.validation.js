import Joi from "joi";
export const signup={
   body: Joi.object({
    name: Joi.string().required().min(2).max(25).messages({
        'string.min': "يجب ان يكون اسم المستخدم على الاقل حرفان ",
        'string.max': "يجب ان يكون اسم المستخدم على الاكثر 25 حرف"
    }),
    email: Joi.string().email().required().messages({
        'string.email': "يرجى ادخال عنوان بريد الكتروني صحيح"
    }),
    password: Joi.string().required().min(7).messages({
        'string.min': 'يجب ان تتكون كلمة المرور من 7 احرف على الاقل'
    }),
   
    role: Joi.string().valid('maneger', 'Specialist', 'guardian', 'admin','marketing_agents', 'guest').default('guest'),  
   }).required()
}
export const signin={
    body:Joi.object({
        email: Joi.string().email().required().messages({
            'string.email': "يرجى ادخال عنوان بريد الكتروني صحيح"
        }),
        password: Joi.string().required().min(7).messages({
            'string.min': 'يجب ان تتكون كلمة المرور من 7 احرف على الاقل'
        }),

    }).required()
}