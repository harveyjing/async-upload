import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UploadFormV2 from "../components/v2/UploadFormV2";
import FileList from "../components/FileList";

const V2Page = () => {
  const [activeTab, setActiveTab] = useState("upload");
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-2">
              Upload System - Version 2
            </h1>
            <p className="text-muted-foreground">
              Async upload - instant job submission with background file
              processing
            </p>
          </div>

          {/* Version Info Card */}
          {/* <Card>
            <CardHeader>
              <CardTitle className="text-lg">Version 2 Features</CardTitle>
              <CardDescription>
                Modern asynchronous upload approach
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li>• ✨ Instant job submission - no waiting for uploads</li>
                <li>• 🚀 Background file processing with real-time progress</li>
                <li>• 📋 Job queue management in memory</li>
                <li>• 🔔 Toast notifications for all status updates</li>
                <li>• 📱 Non-blocking UI - submit multiple jobs simultaneously</li>
                <li>• ⚠️ Jobs are lost on page refresh (no upload resume support)</li>
              </ul>
            </CardContent>
          </Card> */}

          {/* Main Content Tabs */}
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="space-y-6"
          >
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
              <TabsTrigger value="upload">Upload Form</TabsTrigger>
              <TabsTrigger value="files">File List</TabsTrigger>
            </TabsList>

            <TabsContent value="upload" className="space-y-6">
              <div className="max-w-4xl mx-auto">
                <UploadFormV2 />
              </div>
            </TabsContent>

            <TabsContent value="files" className="space-y-6">
              <div className="max-w-4xl mx-auto">
                <FileList active={activeTab === "files"} />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default V2Page;
