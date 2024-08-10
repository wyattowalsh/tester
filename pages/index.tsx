import { useState, useEffect } from 'react';
import * as d3 from 'd3';
import fetch from 'node-fetch';
import 'tailwindcss/tailwind.css';
import { Button, Input } from 'shadcn-ui';

const IndexPage = () => {
  const [url, setUrl] = useState('');
  const [sitemapData, setSitemapData] = useState(null);

  const fetchSitemap = async (url) => {
    try {
      const response = await fetch(url);
      const text = await response.text();
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(text, 'application/xml');
      const urls = Array.from(xmlDoc.getElementsByTagName('url')).map((urlElement) => {
        return {
          loc: urlElement.getElementsByTagName('loc')[0].textContent,
          lastmod: urlElement.getElementsByTagName('lastmod')[0]?.textContent,
        };
      });
      setSitemapData(urls);
    } catch (error) {
      console.error('Error fetching sitemap:', error);
    }
  };

  useEffect(() => {
    if (sitemapData) {
      const svg = d3.select('#sitemap')
        .append('svg')
        .attr('width', 800)
        .attr('height', 600);

      const nodes = sitemapData.map((d, i) => ({ id: i, ...d }));
      const links = nodes.map((d, i) => ({ source: 0, target: i }));

      const simulation = d3.forceSimulation(nodes)
        .force('link', d3.forceLink(links).id(d => d.id))
        .force('charge', d3.forceManyBody())
        .force('center', d3.forceCenter(400, 300));

      const link = svg.append('g')
        .selectAll('line')
        .data(links)
        .enter().append('line')
        .attr('stroke-width', 1.5);

      const node = svg.append('g')
        .selectAll('circle')
        .data(nodes)
        .enter().append('circle')
        .attr('r', 5)
        .attr('fill', 'blue');

      simulation.on('tick', () => {
        link
          .attr('x1', d => d.source.x)
          .attr('y1', d => d.source.y)
          .attr('x2', d => d.target.x)
          .attr('y2', d => d.target.y);

        node
          .attr('cx', d => d.x)
          .attr('cy', d => d.y);
      });
    }
  }, [sitemapData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchSitemap(url);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Sitemap Visualizer</h1>
      <form onSubmit={handleSubmit} className="mb-4">
        <Input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Enter sitemap URL"
          className="mr-2"
        />
        <Button type="submit">Visualize</Button>
      </form>
      <div id="sitemap"></div>
    </div>
  );
};

export default IndexPage;
