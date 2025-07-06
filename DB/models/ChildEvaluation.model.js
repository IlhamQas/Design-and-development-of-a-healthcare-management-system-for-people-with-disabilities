import mongoose from "mongoose";

const SiblingSchema = new mongoose.Schema({
  name: { type: String },
  age: { type: Number },
  notes: { type: String },
});

const DiseaseSchema = new mongoose.Schema({
  diseaseName: { type: String },
  hasDisease: { type: Boolean },
  notes: { type: String },
});

const EvaluationSchema = new mongoose.Schema({
  guardianId: {
    type: mongoose.Types.ObjectId,
    ref: 'user',
    required: true
  },
  specialistId: {
    type: mongoose.Types.ObjectId,
    ref: 'user',
    required: true
  },
  child: {
    fullName: { type: String, required: true },
    age: { type: Number, required: true },
    birthDate: { type: Date, required: true },
    birthPlace: { type: String },
    gender: { type: String, enum: ['male', 'female'], required: true },
    homePhone: { type: String },
    address: { type: String },
    referralSource: { type: String },
    schoolName: { type: String },
    gradeLevel: { type: String },
  },
  parents: {
    motherName: { type: String },
    fatherName: { type: String },
    motherEducation: { type: String },
    fatherEducation: { type: String },
    motherJob: { type: String },
    fatherJob: { type: String },
    motherMobile: { type: String },
    fatherMobile: { type: String },
    motherWorkplace: { type: String },
    fatherWorkplace: { type: String },
  },
  family: {
    parentRelationship: { type: String },
    speechProblems: { type: String },
  },
  development: {
    motherAgeDuringPregnancy: { type: Number },
    motherSmoker: { type: String, enum: ['yes', 'no', ''] },
    miscarriages: { type: String, enum: ['yes', 'no', ''] },
    pregnancyDuration: { type: String },
    motherPregnancyProblems: { type: String },
    fetusProblems: { type: String },
  },
  postBirth: {
    birthType: { type: String, enum: ['cesarean', 'natural', 'mixed', ''] },
    birthWeight: { type: Number },
    birthProblems: { type: String },
    feedingType: { type: String },
    surgery: {
      type: { type: String },
      result: { type: String },
    },
    medications: { type: String },
  },
  siblings: [SiblingSchema],
  diseases: [DiseaseSchema],
  motorDevelopment: {
    headLift: { type: String },
    crawling: { type: String },
    sitting: { type: String },
    standing: { type: String },
    walking: { type: String },
    sleepingAlone: { type: String },
    toilet: { type: String },
    eatingTeething: { type: String },
   
  },
  speechDevelopment: {
    firstWordTime: { type: String },
    understandingOthers: { type: String },
    sentenceProduction: { type: String },
    sentenceWordCount: { type: String },
    vocabularyPresence: { type: String },
    voiceEvaluation: {
      hyponasal: { type: String },
      hypernasal: { type: String },
      normalVoice: { type: String },
      breathing: { type: String },
    },
    stuttering: {
      disfluency: { type: String },
      speechSpeed: { type: String },
      startAge: { type: String },
      situations: { type: String },
    },
  },
  cognitiveAssessment: {
    concentration: { type: String },
    attentionSpan: { type: String },
    playsWithToys: { type: String },
    goodMemory: { type: String },
    problemSolving: { type: String },
    autism: {
      isVerbal: { type: String },
      communicationMethod: { type: String },
      repetitiveBehaviors: { type: String },
      toeWalking: { type: String },
      repetitiveSounds: { type: String },
    },
  
  },
  socialDomain: {
    interactionFamily: { type: String },
    spontaneousSpeech: { type: String },
    understandOthers: { type: String },
    adaptationNewEnv: { type: String },
    helpWithoutRequest: { type: String },
    activityLevel: { type: String },
    hyperactivity: { type: String },
    nonverbalExpression: { type: String },
    childPersonality: { type: String },
    childFeelingsProblem: { type: String },
    interactionOthers: { type: String },
    teacherResponse: { type: String },
    isCalm: { type: String },
    focusDuration: { type: String },
    isSocial: { type: String },
    separatesEasily: { type: String },
    isIndependent: { type: String },
    selfConfidence: { type: String },
    problemHistory: {
      fingerSucking: { type: String },
      bedwetting: { type: String },
      attentionDeficit: { type: String },
      sleepDisorders: { type: String },
      eatingDisorders: { type: String },
      anxiety: { type: String },
      stubbornness: { type: String },
      aggressiveness: { type: String },
      tension: { type: String },
      moodSwings: { type: String },
    },
    peerActivities: { type: String },
    peerRelationships: { type: String },
    initiatesPlay: { type: String },
    competitionParticipation: { type: String },
    socialActivities: { type: String },
    responseFear: { type: String },
    responseHappy: { type: String },
    responseSad: { type: String },
    likes: { type: String },
    dailyRoutine: { type: String },
    freeTime: { type: String },
    treatmentExpectations: { type: String },
   
  },
  selfHelpSkills: {
    pointUpDown: { type: String },
    pointRightLeft: { type: String },
    whereGoLion: { type: String },
    whereBuyChips: { type: String },
    whereGoWhenSick: { type: String },
    whatDoWhenThirsty: { type: String },
    whenSleep: { type: String },
    whenSunrise: { type: String },
    chickenLegs: { type: String },
    biggerTreeOrFlower: { type: String },
    hotSeason: { type: String },
    nightColor: { type: String },
    
  },
  otherSkills: {
    grossMotorSkills: {
      walking: { type: String },
      running: { type: String },
      jumping: { type: String },
    },
    fineMotorSkills: {
      grasping: { type: String },
      eyeHandCoordination: { type: String },
      scissorUse: { type: String },
    },
    cognitiveSkills: {
      concentration: { type: String },
      memory: { type: String },
      planning: { type: String },
    },
    visualCognitiveSkills: {
      visualDiscrimination: { type: String },
      visualMemory: { type: String },
      visualTracking: { type: String },
    },
    dailyLifeActivities: {
      handWashing: { type: String },
      teethBrushing: { type: String },
      toiletUse: { type: String },
    },
  },
}, { timestamps: true });

const EvaluationModel = mongoose.model('ChildEvaluation', EvaluationSchema);
export default EvaluationModel;
