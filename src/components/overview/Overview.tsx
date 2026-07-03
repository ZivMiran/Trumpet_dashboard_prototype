import { PulseInsightCarousel } from './PulseInsightCarousel';
import { KpiRibbon } from './KpiRibbon';
import { StreamsChart } from './StreamsChart';
import { RevenueDonut } from './RevenueDonut';
import './Overview.css';

export function Overview() {
  return (
    <div className="overview-page">
      <PulseInsightCarousel />
      <KpiRibbon />
      <div className="overview-page__charts">
        <StreamsChart />
        <RevenueDonut />
      </div>
    </div>
  );
}
