import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { useState } from "react";
import { toast } from "sonner";

export default function HealthProfilePage() {
  const [age, setAge] = useState("32");
  const [weight, setWeight] = useState("78");
  const [height, setHeight] = useState("175");
  const [activity, setActivity] = useState([5]);
  const [sleep, setSleep] = useState([7]);

  const bmi = weight && height ? (parseFloat(weight) / Math.pow(parseFloat(height) / 100, 2)).toFixed(1) : "—";

  const handleSave = () => {
    toast.success("Health profile updated successfully!");
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl">
        <div>
          <h1 className="text-2xl font-display font-bold">Health Profile</h1>
          <p className="text-muted-foreground text-sm">Manage your personal health information.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="shadow-card">
            <CardHeader><CardTitle className="text-base font-display">Basic Information</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Age</Label>
                <Input type="number" value={age} onChange={e => setAge(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Weight (kg)</Label>
                <Input type="number" value={weight} onChange={e => setWeight(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Height (cm)</Label>
                <Input type="number" value={height} onChange={e => setHeight(e.target.value)} />
              </div>
              <div className="p-4 rounded-lg bg-secondary">
                <p className="text-sm text-muted-foreground">Auto-calculated BMI</p>
                <p className="text-3xl font-display font-bold text-primary">{bmi}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader><CardTitle className="text-base font-display">Lifestyle</CardTitle></CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label>Physical Activity (days/week): {activity[0]}</Label>
                <Slider value={activity} onValueChange={setActivity} max={7} min={0} step={1} />
              </div>
              <div className="space-y-3">
                <Label>Average Sleep (hours): {sleep[0]}</Label>
                <Slider value={sleep} onValueChange={setSleep} max={12} min={3} step={0.5} />
              </div>
              <div className="space-y-2">
                <Label>Diet Type</Label>
                <Select defaultValue="mixed">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mixed">Mixed</SelectItem>
                    <SelectItem value="vegetarian">Vegetarian</SelectItem>
                    <SelectItem value="vegan">Vegan</SelectItem>
                    <SelectItem value="keto">Keto</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Smoking Status</Label>
                <Select defaultValue="never">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="never">Never</SelectItem>
                    <SelectItem value="former">Former</SelectItem>
                    <SelectItem value="current">Current</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card md:col-span-2">
            <CardHeader><CardTitle className="text-base font-display">Medical History</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Blood Pressure</Label>
                  <Input defaultValue="120/80" />
                </div>
                <div className="space-y-2">
                  <Label>Blood Sugar (mg/dL)</Label>
                  <Input type="number" defaultValue="95" />
                </div>
                <div className="space-y-2">
                  <Label>Cholesterol (mg/dL)</Label>
                  <Input type="number" defaultValue="190" />
                </div>
                <div className="space-y-2">
                  <Label>Family History</Label>
                  <Select defaultValue="none">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="diabetes">Diabetes</SelectItem>
                      <SelectItem value="heart">Heart Disease</SelectItem>
                      <SelectItem value="cancer">Cancer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Button onClick={handleSave} className="gradient-primary text-primary-foreground px-8">
          Save Profile
        </Button>
      </div>
    </DashboardLayout>
  );
}
