import React, { useMemo } from 'react';
import { CharacterState } from '../types/game';

interface ViewContainerProps {
  activeTab: string;
  state: CharacterState;
  onRefresh: () => void;
}

export const ViewContainer: React.FC<ViewContainerProps> = ({
  activeTab,
  state,
  onRefresh,
}) => {
  const viewHtml = useMemo(() => {
    if (typeof window === 'undefined') return '';
    const win = window as any;

    if (typeof win.getViewFn === 'function') {
      try {
        const fn = win.getViewFn(activeTab);
        return fn ? fn() : '';
      } catch (e) {
        console.error('Error generating view:', e);
        return '<div class="card"><h3>View Error</h3><p class="muted">Could not render this section.</p></div>';
      }
    }
    return '';
  }, [activeTab, state]);

  const sectionContext = useMemo(() => {
    if (typeof window === 'undefined') return '';
    const win = window as any;
    if (typeof win.sectionContextHtml === 'function') {
      try {
        return win.sectionContextHtml();
      } catch (e) {
        return '';
      }
    }
    return '';
  }, [activeTab, state]);

  // When clicking anywhere in view container, if a button with onclick was pressed,
  // notify React so state updates synchronously!
  const handleClick = (e: React.MouseEvent) => {
    const target = (e.target as HTMLElement).closest('button, .country-card, .encounter-opt, .opt, .subnav-btn, summary');
    if (target) {
      // Allow the native onclick to fire on window, then trigger state refresh
      setTimeout(() => {
        onRefresh();
      }, 30);
    }
  };

  return (
    <div id="view" onClick={handleClick}>
      {sectionContext && (
        <div dangerouslySetInnerHTML={{ __html: sectionContext }} />
      )}
      <div dangerouslySetInnerHTML={{ __html: viewHtml }} />
    </div>
  );
};
