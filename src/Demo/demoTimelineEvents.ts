import { TimelineEvent } from "@/components/TimelineModal";

export const demoTimelineEvents: TimelineEvent[] = [
  {
    phase: "pre-diagnosis",
    type: "symptom",
    date: "2019-11",
    desc: ["Dizzy spells", "Tinnitus", "Skull tenderness above ear","Hearing loss"],
  },
  {
    phase: "diagnosis",
    type: "medical_investigation",
    date : "2020-02",
    desc: ["Passed out twice","initially treated for low blood pressure"]
  },
  {
    phase: "diagnosis",
    type: "medical_test",
    date: "2020-08",
    desc: ["Meningioma tumor discovered"]
  },
  {
    phase: "pre-surgery",
    type: "medical_consultation",
    date: "2020-10",
    desc: ["Surgery decided due to tumor size and spread"]
  },
  {
    phase: "surgery",
    type: "surgical_procedure",
    date: "2020-11-19",
    desc: ["Meningioma Tumor Removal"]
  },
  {
    phase: "post-surgery",
    type: "recovery",
    date: "2020-11-23",
    desc: ["Discharged 4 days after surgery","Temporary speech difficulties","Gradual memory recovery"]
  },
  {
    phase: "post-surgery",
    type: "symptoms",
    date: "2020-12",
    desc: ["Swelling","Sinus porblems","Fatigue","Itchy scalp","Reduced sensation around scar"]
  },
  {
    phase: "follow-up",
    type: "medical_monitoring",
    date: "2021",
    desc: ["Scheduled follow-up scans"]
  }
]