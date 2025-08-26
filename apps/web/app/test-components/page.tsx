import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function ComponentTestPage() {
  return (
    <div className="container mx-auto p-8 space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-foreground mb-4">
          ShadCN Component Test
        </h1>
        <p className="text-muted-foreground">
          Testing all installed components to ensure they work correctly
        </p>
      </div>

      {/* Button Tests */}
      <Card>
        <CardHeader>
          <CardTitle>Button Component</CardTitle>
          <CardDescription>
            Testing different button variants and sizes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-4">
            <Button>Default Button</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="destructive">Destructive</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="link">Link</Button>
          </div>
          <div className="flex flex-wrap gap-4">
            <Button size="sm">Small</Button>
            <Button size="default">Default</Button>
            <Button size="lg">Large</Button>
          </div>
        </CardContent>
      </Card>

      {/* Input Tests */}
      <Card>
        <CardHeader>
          <CardTitle>Input Component</CardTitle>
          <CardDescription>
            Testing input field functionality and styling
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input placeholder="Default input" />
          <Input placeholder="Email input" type="email" />
          <Input placeholder="Password input" type="password" />
          <Input placeholder="Disabled input" disabled />
        </CardContent>
      </Card>

      {/* Card Layout Test */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Card 1</CardTitle>
            <CardDescription>First test card</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              This is a test card to verify the layout and styling.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Card 2</CardTitle>
            <CardDescription>Second test card</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full">Card Button</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Card 3</CardTitle>
            <CardDescription>Third test card</CardDescription>
          </CardHeader>
          <CardContent>
            <Input placeholder="Card input" />
          </CardContent>
        </Card>
      </div>

      {/* Color and Theme Test */}
      <Card>
        <CardHeader>
          <CardTitle>Color & Theme Test</CardTitle>
          <CardDescription>
            Testing CSS variables and color tokens
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-primary text-primary-foreground rounded">
              Primary
            </div>
            <div className="p-4 bg-secondary text-secondary-foreground rounded">
              Secondary
            </div>
            <div className="p-4 bg-muted text-muted-foreground rounded">
              Muted
            </div>
            <div className="p-4 bg-accent text-accent-foreground rounded">
              Accent
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Success Message */}
      <Card className="border-green-200 bg-green-50">
        <CardContent className="pt-6">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-green-500 rounded-full"></div>
            <p className="text-green-800 font-medium">
              ✅ All components are rendering correctly!
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
