import { useEffect, useState } from 'react';
import mermaid from 'mermaid';
import { Card } from "@/components/ui/card";

const flowchartDefinition = `
graph TD
    A[Start] --> B{Check Credentials}
    B -->|Invalid| C[Configure Client ID/Secret]
    B -->|Valid| D{Check Domain}
    D -->|Invalid| E[Configure Domain]
    D -->|Valid| F{Check OAuth Screen}
    F -->|Invalid| G[Setup OAuth Screen]
    F -->|Valid| H{Check Test Users}
    H -->|Invalid| I[Add Test Users]
    H -->|Valid| J[Success]
    
    C --> B
    E --> D
    G --> F
    I --> H
`;

export function OAuthFlowchart() {
  const [svgContent, setSvgContent] = useState<string>('');

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: true,
      theme: 'base',
      securityLevel: 'loose',
      flowchart: {
        curve: 'basis'
      }
    });

    mermaid.render('oauth-flow', flowchartDefinition).then(({ svg }) => {
      setSvgContent(svg);
    });
  }, []);

  return (
    <Card className="p-4 overflow-x-auto">
      <div 
        className="mx-auto"
        dangerouslySetInnerHTML={{ __html: svgContent }}
      />
    </Card>
  );
}
