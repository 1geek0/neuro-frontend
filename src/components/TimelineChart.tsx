"use client"

import { TrendingUp } from "lucide-react"
import { CartesianGrid, Dot, Line, LineChart, XAxis, YAxis } from "recharts"
import { TimelineEvent } from "./TimelineModal"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
const chartData = [
  { visitors: 275, browser: "chrome", fill: "var(--color-chrome)" },
  { visitors: 250, browser: "chrome", fill: "var(--color-chrome)" },
  { visitors: 200, browser: "safari", fill: "var(--color-safari)" },
  { visitors: 187, browser: "firefox", fill: "var(--color-firefox)" },
  { visitors: 173, browser: "edge", fill: "var(--color-edge)" },
  { visitors: 90, browser: "other", fill: "var(--color-other)" },
]

const exampleData = [
  {
    phase: "pre-diagnosis",
    type: "symptom",
    "date": (((new Date("2024-01-15")).getTime()) / (1000 * 60 * 60)) - (((new Date("2024-01-15")).getTime()) / (1000 * 60 * 60)),
    desc: "Persistent headaches and blurred vision",
    "fill": "var(--color-pre_diagnosis)"
  },
  {
    phase: "pre-diagnosis",
    type: "medication",
    date: (((new Date("2024-02-15")).getTime()) / (1000 * 60 * 60)) - (((new Date("2024-01-15")).getTime()) / (1000 * 60 * 60)),
    end_date: "2024-02-15",
    drug_name: "Sumatriptan",
    drug_type: "Antimigraine",
    linked_symptoms: ["Headache"],
    fill: "var(--color-pre_diagnosis)"
  },
  {
    phase: "diagnosis",
    "type": "test",
    date: (((new Date("2024-02-20")).getTime()) / (1000 * 60 * 60)) - (((new Date("2024-01-15")).getTime()) / (1000 * 60 * 60)),
    "test_type": "MRI",
    "specific_test": "MRI with Contrast",
    "location": "Massachusetts General Hospital",
    fill: "var(--color-diagnosis)"
  },
  {
    phase: "diagnosis",
    type: "diagnosis",
    date: (((new Date("2024-02-22")).getTime()) / (1000 * 60 * 60)) - (((new Date("2024-01-15")).getTime()) / (1000 * 60 * 60)),
    "meningioma_grade": "WHO Grade 1",
    "specific_type": "Fibrous Meningioma",
    "linked_specific_tests": ["MRI with Contrast"],
    fill: "var(--color-diagnosis)"
  },
  {
    phase: "pre-surgery",
    "type": "monitoring",
    date: (((new Date("2024-03-01")).getTime()) / (1000 * 60 * 60)) - (((new Date("2024-01-15")).getTime()) / (1000 * 60 * 60)),
    "desc": "Regular monitoring of tumor size and symptoms",
    "frequency": "Monthly",
    fill: "var(--color-pre_surgery)"
  },
  {
    phase: "pre-surgery",
    "type": "experience",
    date: (((new Date("2024-03-15")).getTime()) / (1000 * 60 * 60)) - (((new Date("2024-01-15")).getTime()) / (1000 * 60 * 60)),
    "desc": "Anxiety about upcoming surgery",
    fill: "var(--color-pre_surgery)"

  },
  {
    phase: "surgery",
    "type": "surgery",
    date: (((new Date("2024-05-01")).getTime()) / (1000 * 60 * 60)) - (((new Date("2024-01-15")).getTime()) / (1000 * 60 * 60)),
    "treated_by": "Dr. Sarah Johnson",
    "surgery_type": "Endoscopic Resection",
    "surgery_site": "Skull Base",
    "surgery_location": "Brigham and Women's Hospital",
    fill: "var(--color-surgery)"
  },
  {
    phase: "post-surgery",
    "type": "follow-up",
    date: (((new Date("2024-05-15")).getTime()) / (1000 * 60 * 60)) - (((new Date("2024-01-15")).getTime()) / (1000 * 60 * 60)),
    "desc": "Post-surgical evaluation",
    "outcome": "Good recovery, no complications",
    fill: "var(--color-post_surgery)"
  },
  {
    phase: "post-surgery",
    "type": "regrowth",
    date: (((new Date("2024-06-01")).getTime()) / (1000 * 60 * 60)) - (((new Date("2024-01-15")).getTime()) / (1000 * 60 * 60)),
    "desc": "Small regrowth detected in follow-up MRI",
    "size": "5mm",
    "location": "Original tumor site",
    fill: "var(--color-post_surgery)"
  }
]

interface props {
  events: TimelineEvent[]
}


export function TimelineChart({ events }: props) {
  let chartArray = events.map((event: TimelineEvent) => {
    var firstDay;
    if (events[0].date) {
      firstDay = events[0].date
    } else {
      firstDay = 0;
    }

    var eventDay;
    if (event.date) {
      eventDay = event.date;
    } else {
      eventDay = 0;
    }
    const day = (((((new Date(eventDay)).getTime()) / (1000 * 60 * 60)) - (((new Date(firstDay)).getTime()) / (1000 * 60 * 60))) / 24);

    return {
      day: day > 0 ? day : 0,
      phase: event.phase,
      color: ""
    }
  }
  )
  if (chartArray[0].day && chartArray[1].day && chartArray[0].day > chartArray[1].day) {
    chartArray = [...chartArray].reverse();
  }

  // if (chartArray[0].day && chartArray[1].day && chartArray[0].day > chartArray[1].day) {
  //   chartArray = [...chartArray].reverse();
  // }
  console.log(chartArray)


  const phases = [...new Set(chartArray.map((event: any) => event.phase))];
  // console.log(phases);

  const chartConfig = {
    "day": {
      label: "Day",
      color: "hsl(var(--chart-1))",
    },
  } satisfies ChartConfig

  phases.forEach((phase, index) => {
    chartArray.forEach((element) => {
      if (element.phase === phase)
        element.color = `hsl(var(--chart-${index + 2}))`
    })
  })


  return (
    <Card>
      {/* <CardHeader>
        <CardTitle>Line Chart - Dots Colors</CardTitle>
        <CardDescription>January - June 2024</CardDescription>
      </CardHeader> */}
      <CardContent>
        <ChartContainer config={chartConfig}>
          <LineChart
            accessibilityLayer
            data={chartArray}
            margin={{
              top: 24,
              left: 24,
              right: 24,
            }}
          >
            <XAxis dataKey="phase" />
            <YAxis tickFormatter={(tick) => `Day ${tick}`} />
            <CartesianGrid vertical={false} />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  hideIndicator={true}
                  nameKey="day"
                />
              }
            />
            <Line
              dataKey="day"
              type="monotone"
              stroke="var(--color-day)"
              strokeWidth={2}
              dot={({ payload, ...props}) => {
                return (
                  <Dot
                    key={Math.random().toString(36)}
                    r={5}
                    cx={props.cx}
                    cy={props.cy}
                    fill={payload.color}
                    stroke={payload.fill}
                  />
                )
              }}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
      {/* <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 font-medium leading-none">
          Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
        </div>
        <div className="leading-none text-muted-foreground">
          Showing total visitors for the last 6 months
        </div>
      </CardFooter> */}
    </Card>
  )
}
