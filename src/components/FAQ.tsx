import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion'
import { useState } from 'react';
export default function FAQSection() {
    const [questions, setQuestions] = useState({
        before: ["What are the common risks of surgery?", "What should I do to prepare for surgery?", "How can I set up my home for recovery?", "What should I tell my doctor about my medications?"],
        after: ["What are the best exercises for recovery?", "How long will it take to return to work?", "When should I call if I'm concerned about my health?", "How often should I get imaging scans?"],
        during: ["What are some common side effects after treatment?", "How can I manage fatigue during recovery?", "What should I eat to support my recovery?", "When should I seek emergency care?"]
    });

    return (
        <section className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-bold mb-4 text-gray-900">Frequently Asked Questions</h2>
            <Accordion type="single" collapsible className="space-y-4">
                <AccordionItem
                    value="before"
                    className="bg-white rounded-lg border shadow-sm"
                >
                    <AccordionTrigger className="px-6 hover:no-underline hover:bg-gray-50 rounded-t-lg [&[data-state=open]]:rounded-b-none">
                        Top Questions to Ask Before Surgery
                    </AccordionTrigger>
                    <AccordionContent className="px-6 pb-4">
                        <ul className="space-y-2">
                            {questions.before.map((q, i) => (
                                <li key={i} className="text-gray-600">
                                    {q}
                                    <div className="mt-2 p-2 bg-gray-100 rounded-md">
                                        <p className="text-gray-500">
                                            {i === 0 && "Surgery may carry certain concerns, but understanding them can ease your mind. Common risks might involve mild swelling, infection, or reactions to anesthesia. The good news is that complications are often rare, and many patients recover well. By talking openly with your medical team, you'll feel more informed, supported, and confident about your next steps, knowing they will guide you every step of the way."}
                                            {i === 1 && "Preparing for surgery includes a few adjustments to your diet, such as limiting heavy meals or alcohol. Your doctor may also suggest avoiding certain supplements. While it might feel restrictive, remember these steps help ensure a smoother operation. Following specific guidelines, including any fasting instructions, helps your body stay ready for a safe, successful surgery, and supports your overall well being."}
                                            {i === 2 && "Setting up your home in advance makes recovery more comfortable and less stressful. Consider creating a cozy rest area with easy access to the bathroom, kitchen, and any medical supplies. Removing tripping hazards, organizing daily essentials within reach, and asking loved ones for help can make a big difference. With some planning, you'll have a safer space that supports smooth healing."}
                                            {i === 3 && "Always share a detailed list of your medications and supplements with your doctor, so they can offer clear guidance. Certain medicines, like blood thinners or specific pain relievers, may need a brief pause before surgery. This precaution lowers the risk of complications and ensures a smoother procedure. By staying informed and working closely with your medical team, you can feel confident in your treatment plan."}
                                        </p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem
                    value="after"
                    className="bg-white rounded-lg shadow-sm border"
                >
                    <AccordionTrigger className="px-6 hover:no-underline hover:bg-gray-50 rounded-t-lg [&[data-state=open]]:rounded-b-none">
                        Top Questions to Ask After Surgery
                    </AccordionTrigger>
                    <AccordionContent className="px-6 pb-4">
                        <ul className="space-y-2">
                            {questions.after.map((q, i) => (
                                <li key={i} className="text-gray-600">
                                    {q}
                                    <div className="mt-2 p-2 bg-gray-100 rounded-md">
                                        <p className="text-gray-500">
                                            {i === 0 && "Light, gentle movements like short walks often help with blood flow and healing. Your doctor may suggest simple exercises or physical therapy to gradually rebuild strength. It's best to avoid heavy lifting or strenuous workouts until your care team says it's safe, so you can focus on healing at a comfortable pace."}
                                            {i === 1 && "Recovery time varies from person to person, so your doctor's guidance is key. Many people start with part-time hours or lighter tasks before returning to their regular schedule. Communication with your employer, along with a flexible plan, can ensure you make a gradual, balanced transition back to work."}
                                            {i === 2 && "A little discomfort or mild headaches can be normal, but more serious concerns like increased pain, swelling, or sudden changes in vision or speech are reasons to call right away. If something feels off or if you have a fever, never hesitate to reach out—timely support can give you peace of mind."}
                                            {i === 3 && "Most doctors recommend periodic imaging to keep track of your recovery and watch for any signs of regrowth. These scans might be done every few months or annually, depending on your specific case. Keeping up with these check-ups helps your medical team provide the best care and reassurance for your long-term health."}
                                        </p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </AccordionContent>
                </AccordionItem>

                <AccordionItem
                    value="during"
                    className="bg-white rounded-lg shadow-sm border"
                >
                    <AccordionTrigger className="px-6 hover:no-underline hover:bg-gray-50 rounded-t-lg [&[data-state=open]]:rounded-b-none">
                        Top Questions to Ask During/After Treatment
                    </AccordionTrigger>
                    <AccordionContent className="px-6 pb-4">
                        <ul className="space-y-2">
                            {questions.during.map((q, i) => (
                                <li key={i} className="text-gray-600">
                                    {q}
                                    <div className="mt-2 p-2 bg-gray-100 rounded-md">
                                        <p className="text-gray-500">
                                            {i === 0 && "Some mild headaches, fatigue, or slight dizziness can be common after meningioma treatment. However, any sudden changes in strength, speech, or vision should be reported right away. If you experience unusually severe pain, persistent vomiting, or fever, you should also call your doctor. Your medical team is here to guide you, so never hesitate to reach out if something feels unusual."}
                                            {i === 1 && "Fatigue is a common part of the healing process, but there are ways to make it more manageable. Start by pacing yourself and allowing for short naps or rest periods throughout the day. Balancing movement with rest can boost energy levels over time. Staying hydrated, eating nutritious foods, and talking to your doctor about vitamins or gentle exercises can also help."}
                                            {i === 2 && "A balanced, nutrient rich diet can support recovery and overall health. Many patients benefit from including lean protein sources, fruits, and vegetables in their daily meals. Staying hydrated is equally important, so make sure to drink enough water. You may want to limit sugary or heavily processed foods. If you have any special dietary needs or concerns, consider consulting with a nutrition specialist who can offer personalized advice."}
                                            {i === 3 && "While mild discomfort can be normal during recovery, it is crucial to recognize signs that need immediate attention. These might include sudden or severe headaches, confusion, trouble speaking or moving, and any rapid changes in alertness or consciousness. If you have escalating pain, unstoppable bleeding, or intense dizziness, do not hesitate to seek emergency care. Early intervention can make a significant difference in your well being."}
                                        </p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </section>
    )
}