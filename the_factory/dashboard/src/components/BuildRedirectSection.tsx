import React, { useState, useEffect } from 'react';
import { Eye, ExternalLink } from 'lucide-react';
import { BuildEntry } from '../lib/builds';

interface BuildRedirectSectionProps {
  ideaSlug: string;
  ideaName: string;
  runId?: string;
  onNavigateToBuilds?: () => void;
}

const BuildRedirectSection: React.FC<BuildRedirectSectionProps> = ({ 
  ideaSlug, 
  ideaName, 
  runId, 
  onNavigateToBuilds 
}) => {
  const [linkedBuild, setLinkedBuild] = useState<BuildEntry | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if there's a build linked to this idea
    const checkForLinkedBuild = async () => {
      try {
        const response = await fetch('/builds.json');
        if (response.ok) {
          const buildsData = await response.json();
          const matchingBuild = buildsData.builds?.find((build: BuildEntry) => 
            build.origin.ideaSlug === ideaSlug || 
            build.slug.toLowerCase() === ideaSlug.toLowerCase()
          );
          setLinkedBuild(matchingBuild || null);
        }
      } catch (error) {
        console.error('Failed to check for linked builds:', error);
      } finally {
        setLoading(false);
      }
    };

    checkForLinkedBuild();
  }, [ideaSlug]);

  if (loading) {
    return (
      <div className="detail-section">
        <h3>Build Preview</h3>
        <p>Checking for available builds...</p>
      </div>
    );
  }

  return (
    <div className="detail-section">
      <h3>Build Preview</h3>
      
      {linkedBuild ? (
        <div className="linked-build-info">
          <div className="build-available">
            <div className="build-status">
              <span className={`status-badge ${linkedBuild.status}`}>
                {linkedBuild.status}
              </span>
              <span className={`mode-badge ${linkedBuild.origin.mode}`}>
                {linkedBuild.origin.mode}
              </span>
            </div>
            <p>
              <strong>Build available:</strong> {linkedBuild.name}
            </p>
            <p className="build-path">
              <code>{linkedBuild.buildPath}</code>
            </p>
            <p className="build-date">
              Created: {new Date(linkedBuild.createdAt).toLocaleDateString()}
            </p>
          </div>
          
          {onNavigateToBuilds && (
            <button 
              className="go-to-builds-button"
              onClick={onNavigateToBuilds}
            >
              <Eye size={16} />
              View in Builds
            </button>
          )}
        </div>
      ) : (
        <div className="no-linked-build">
          <p>No build linked to this idea.</p>
          <p className="build-hint">
            Dream builds and completed pipeline builds are available in the Builds section.
          </p>
          
          {onNavigateToBuilds && (
            <button 
              className="go-to-builds-button"
              onClick={onNavigateToBuilds}
            >
              <ExternalLink size={16} />
              Browse All Builds
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default BuildRedirectSection;