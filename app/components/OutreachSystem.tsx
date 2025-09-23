'use client';

import React, { useState, useEffect } from 'react';
import { Users, Mail, Send, Plus, Edit, Trash2, UserCheck, UserX, Clock, FileText, Wand2, Globe } from 'lucide-react';

const OutreachSystem = () => {
  // Sample data - in real app this would come from a backend
  const [contacts, setContacts] = useState([
    {
      id: 1,
      name: 'John Smith',
      email: 'john@company.com',
      company: 'Tech Corp',
      status: 'email_sent',
      lastContacted: '2024-01-15',
      notes: 'Interested in our solution',
      group: 'investors'
    },
    {
      id: 2,
      name: 'Sarah Johnson',
      email: 'sarah@startup.io',
      company: 'Startup Inc',
      status: 'replied',
      lastContacted: '2024-01-14',
      notes: 'Wants to schedule a demo',
      group: 'collabs'
    },
    {
      id: 3,
      name: 'Mike Davis',
      email: 'mike@enterprise.com',
      company: 'Enterprise Ltd',
      status: 'follow_up_needed',
      lastContacted: '2024-01-10',
      notes: 'No response to first email',
      group: 'prospects'
    },
    {
      id: 4,
      name: 'Lisa Chen',
      email: 'lisa@bigcorp.com',
      company: 'Big Corp',
      status: 'not_contacted',
      lastContacted: null,
      notes: 'New lead from LinkedIn',
      group: 'investors'
    },
    {
      id: 5,
      name: 'Robert Brown',
      email: 'robert@oldcompany.com',
      company: 'Old Company',
      status: 'no_response',
      lastContacted: '2024-01-05',
      notes: 'Multiple attempts made',
      group: 'cold_leads'
    }
  ]);

  const [customGroups, setCustomGroups] = useState([
    { id: 'investors', label: 'Investors', color: 'bg-purple-100 text-purple-800' },
    { id: 'collabs', label: 'Collaborators', color: 'bg-green-100 text-green-800' },
    { id: 'prospects', label: 'Prospects', color: 'bg-blue-100 text-blue-800' },
    { id: 'cold_leads', label: 'Cold Leads', color: 'bg-gray-100 text-gray-800' },
    { id: 'customers', label: 'Customers', color: 'bg-yellow-100 text-yellow-800' }
  ]);

  const [emailTemplates, setEmailTemplates] = useState([
    {
      id: 1,
      name: 'Investor Pitch',
      subject: 'Investment opportunity at {{company}}',
      body: 'Hi {{name}},\n\nI hope this email finds you well. I wanted to reach out because I believe {{company}} represents an exciting investment opportunity that aligns with your portfolio.\n\nWe are revolutionizing the industry with our innovative approach...\n\nWould you be interested in a brief call to discuss this opportunity?\n\nBest regards',
      group: 'investors',
      language: 'en',
      createdAt: '2024-01-10'
    },
    {
      id: 2,
      name: 'Collaboration Proposal',
      subject: 'Partnership opportunity with {{company}}',
      body: 'Hello {{name}},\n\nI came across {{company}} and was impressed by your work in the industry.\n\nI believe there could be great synergy between our companies and wanted to explore potential collaboration opportunities.\n\nWould you be open to a discussion?\n\nBest regards',
      group: 'collabs',
      language: 'en',
      createdAt: '2024-01-12'
    }
  ]);

  const [activeTab, setActiveTab] = useState('all');
  const [showNewContactForm, setShowNewContactForm] = useState(false);
  const [showEmailComposer, setShowEmailComposer] = useState(false);
  const [showNewGroupForm, setShowNewGroupForm] = useState(false);
  const [showTemplateForm, setShowTemplateForm] = useState(false);
  const [showAiTemplateGenerator, setShowAiTemplateGenerator] = useState(false);
  const [selectedContacts, setSelectedContacts] = useState(new Set());
  const [selectedGroupFilter, setSelectedGroupFilter] = useState('all');
  
  const [newContact, setNewContact] = useState({
    name: '',
    email: '',
    company: '',
    status: 'not_contacted',
    notes: '',
    group: 'prospects'
  });

  const [newGroup, setNewGroup] = useState({
    label: '',
    color: 'bg-blue-100 text-blue-800'
  });

  const [newTemplate, setNewTemplate] = useState({
    id: null as number | null,
    name: '',
    subject: '',
    body: '',
    group: 'prospects',
    language: 'en',
    createdAt: null as string | null
  });

  const [aiTemplateGenerator, setAiTemplateGenerator] = useState({
    purpose: '',
    tone: 'professional',
    language: 'en',
    targetGroup: 'prospects',
    companyInfo: '',
    additionalContext: '',
    generating: false
  });

  const [emailComposer, setEmailComposer] = useState({
    template: '',
    subject: '',
    body: '',
    selectedContacts: []
  });

  const statusOptions = [
    { value: 'not_contacted', label: 'Not Contacted', color: 'bg-gray-100 text-gray-800' },
    { value: 'email_sent', label: 'Email Sent', color: 'bg-blue-100 text-blue-800' },
    { value: 'replied', label: 'Replied', color: 'bg-green-100 text-green-800' },
    { value: 'follow_up_needed', label: 'Follow Up Needed', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'no_response', label: 'No Response', color: 'bg-red-100 text-red-800' },
    { value: 'interested', label: 'Interested', color: 'bg-purple-100 text-purple-800' },
    { value: 'not_interested', label: 'Not Interested', color: 'bg-gray-100 text-gray-800' }
  ];

  const colorOptions = [
    'bg-blue-100 text-blue-800',
    'bg-green-100 text-green-800',
    'bg-purple-100 text-purple-800',
    'bg-yellow-100 text-yellow-800',
    'bg-red-100 text-red-800',
    'bg-indigo-100 text-indigo-800',
    'bg-pink-100 text-pink-800',
    'bg-gray-100 text-gray-800'
  ];

  const languageOptions = [
    { value: 'en', label: 'English' },
    { value: 'es', label: 'Spanish' },
    { value: 'fr', label: 'French' },
    { value: 'de', label: 'German' },
    { value: 'it', label: 'Italian' },
    { value: 'pt', label: 'Portuguese' },
    { value: 'ru', label: 'Russian' },
    { value: 'zh', label: 'Chinese' },
    { value: 'ja', label: 'Japanese' },
    { value: 'ko', label: 'Korean' }
  ];

  const toneOptions = [
    { value: 'professional', label: 'Professional' },
    { value: 'friendly', label: 'Friendly' },
    { value: 'formal', label: 'Formal' },
    { value: 'casual', label: 'Casual' },
    { value: 'persuasive', label: 'Persuasive' },
    { value: 'urgent', label: 'Urgent' }
  ];

  const tabs = [
    { id: 'all', label: 'All Contacts', icon: Users, count: contacts.length },
    { id: 'replied', label: 'Replied', icon: UserCheck, count: contacts.filter(c => c.status === 'replied').length },
    { id: 'no_response', label: 'No Response', icon: UserX, count: contacts.filter(c => c.status === 'no_response').length },
    { id: 'follow_up', label: 'Follow Up Needed', icon: Clock, count: contacts.filter(c => c.status === 'follow_up_needed').length },
    { id: 'not_contacted', label: 'Not Contacted', icon: Mail, count: contacts.filter(c => c.status === 'not_contacted').length },
    { id: 'templates', label: 'Email Templates', icon: FileText, count: emailTemplates.length }
  ];

  const getFilteredContacts = () => {
    let filtered = contacts;
    
    // Filter by tab
    switch (activeTab) {
      case 'replied': filtered = contacts.filter(c => c.status === 'replied'); break;
      case 'no_response': filtered = contacts.filter(c => c.status === 'no_response'); break;
      case 'follow_up': filtered = contacts.filter(c => c.status === 'follow_up_needed'); break;
      case 'not_contacted': filtered = contacts.filter(c => c.status === 'not_contacted'); break;
      default: filtered = contacts;
    }
    
    // Filter by group
    if (selectedGroupFilter !== 'all') {
      filtered = filtered.filter(c => c.group === selectedGroupFilter);
    }
    
    return filtered;
  };

  const getFilteredTemplates = () => {
    if (selectedGroupFilter === 'all') {
      return emailTemplates;
    }
    return emailTemplates.filter(t => t.group === selectedGroupFilter);
  };

  const updateContactStatus = (contactId, newStatus) => {
    setContacts(prev => prev.map(contact => 
      contact.id === contactId 
        ? { ...contact, status: newStatus, lastContacted: newStatus !== 'not_contacted' ? new Date().toISOString().split('T')[0] : contact.lastContacted }
        : contact
    ));
  };

  const updateContactGroup = (contactId, newGroup) => {
    setContacts(prev => prev.map(contact => 
      contact.id === contactId ? { ...contact, group: newGroup } : contact
    ));
  };

  const addNewContact = () => {
    if (newContact.name && newContact.email) {
      const contact = {
        ...newContact,
        id: Math.max(...contacts.map(c => c.id)) + 1,
        lastContacted: null
      };
      setContacts(prev => [...prev, contact]);
      setNewContact({
        name: '',
        email: '',
        company: '',
        status: 'not_contacted',
        notes: '',
        group: 'prospects'
      });
      setShowNewContactForm(false);
    }
  };

  const addNewGroup = () => {
    if (newGroup.label.trim()) {
      const group = {
        id: newGroup.label.toLowerCase().replace(/\s+/g, '_'),
        label: newGroup.label,
        color: newGroup.color
      };
      setCustomGroups(prev => [...prev, group]);
      setNewGroup({ label: '', color: 'bg-blue-100 text-blue-800' });
      setShowNewGroupForm(false);
    }
  };

  const addNewTemplate = () => {
    if (newTemplate.name && newTemplate.subject && newTemplate.body) {
      const template = {
        ...newTemplate,
        id: newTemplate.id || Math.max(...emailTemplates.map(t => t.id)) + 1,
        createdAt: newTemplate.createdAt || new Date().toISOString().split('T')[0]
      };
      
      if (newTemplate.id) {
        // Update existing template
        setEmailTemplates(prev => prev.map(t => t.id === newTemplate.id ? template : t));
      } else {
        // Add new template
        setEmailTemplates(prev => [...prev, template]);
      }
      
      setNewTemplate({
        id: null,
        name: '',
        subject: '',
        body: '',
        group: 'prospects',
        language: 'en',
        createdAt: null
      });
      setShowTemplateForm(false);
    }
  };

  const generateAiTemplate = async () => {
    setAiTemplateGenerator(prev => ({ ...prev, generating: true }));
    
    // Simulate AI template generation
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const mockGeneratedTemplate = {
      id: null,
      name: `AI Generated - ${aiTemplateGenerator.purpose}`,
      subject: `Regarding ${aiTemplateGenerator.purpose} - {{company}}`,
      body: `Dear {{name}},\n\nI hope this message finds you well. I am reaching out regarding ${aiTemplateGenerator.purpose.toLowerCase()}.\n\n${aiTemplateGenerator.companyInfo ? `About our company: ${aiTemplateGenerator.companyInfo}\n\n` : ''}Based on my research of {{company}}, I believe there could be mutual value in exploring this opportunity together.\n\n${aiTemplateGenerator.additionalContext ? `Additional context: ${aiTemplateGenerator.additionalContext}\n\n` : ''}Would you be available for a brief conversation to discuss this further?\n\nBest regards,\n[Your Name]`,
      group: aiTemplateGenerator.targetGroup,
      language: aiTemplateGenerator.language,
      createdAt: null
    };
    
    setNewTemplate(mockGeneratedTemplate);
    setAiTemplateGenerator(prev => ({ ...prev, generating: false }));
    setShowAiTemplateGenerator(false);
    setShowTemplateForm(true);
  };

  const deleteTemplate = (templateId) => {
    if (confirm('Are you sure you want to delete this template?')) {
      setEmailTemplates(prev => prev.filter(t => t.id !== templateId));
    }
  };

  const toggleContactSelection = (contactId) => {
    setSelectedContacts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(contactId)) {
        newSet.delete(contactId);
      } else {
        newSet.add(contactId);
      }
      return newSet;
    });
  };

  const sendBulkEmail = () => {
    const selectedContactIds = Array.from(selectedContacts);
    setContacts(prev => prev.map(contact => 
      selectedContactIds.includes(contact.id)
        ? { ...contact, status: 'email_sent', lastContacted: new Date().toISOString().split('T')[0] }
        : contact
    ));
    setSelectedContacts(new Set());
    setShowEmailComposer(false);
    alert(`Email sent to ${selectedContactIds.length} contacts!`);
  };

  const getStatusBadge = (status) => {
    const statusConfig = statusOptions.find(s => s.value === status);
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusConfig?.color || 'bg-gray-100 text-gray-800'}`}>
        {statusConfig?.label || status}
      </span>
    );
  };

  const getLanguageLabel = (code) => {
    return languageOptions.find(l => l.value === code)?.label || code;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Outreach Management</h1>
              <p className="text-gray-600 mt-1">Manage your contacts, groups, and email campaigns</p>
            </div>
            <div className="flex gap-3">
              {activeTab === 'templates' ? (
                <>
                  <button
                    onClick={() => setShowNewGroupForm(true)}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                  >
                    <Plus size={18} />
                    Add Group
                  </button>
                  <button
                    onClick={() => setShowAiTemplateGenerator(true)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                  >
                    <Wand2 size={18} />
                    AI Generate
                  </button>
                  <button
                    onClick={() => setShowTemplateForm(true)}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                  >
                    <Plus size={18} />
                    Add Template
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setShowNewContactForm(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                  >
                    <Plus size={18} />
                    Add Contact
                  </button>
                  <button
                    onClick={() => setShowEmailComposer(true)}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                    disabled={selectedContacts.size === 0}
                  >
                    <Send size={18} />
                    Send Email ({selectedContacts.size})
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="flex border-b border-gray-200">
            {tabs.map(tab => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 border-b-2 font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600 bg-blue-50'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <IconComponent size={18} />
                  {tab.label}
                  <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Group Filter */}
          <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium text-gray-700">Filter by group:</label>
              <select
                value={selectedGroupFilter}
                onChange={(e) => setSelectedGroupFilter(e.target.value)}
                className="border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Groups</option>
                {customGroups.map(group => (
                  <option key={group.id} value={group.id}>
                    {group.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Content Area */}
        {activeTab === 'templates' ? (
          /* Email Templates View */
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6">
              <div className="grid gap-6">
                {getFilteredTemplates().map(template => (
                  <div key={template.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{template.name}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${customGroups.find(g => g.id === template.group)?.color || 'bg-gray-100 text-gray-800'}`}>
                            {customGroups.find(g => g.id === template.group)?.label || template.group}
                          </span>
                          <div className="flex items-center gap-1 text-sm text-gray-500">
                            <Globe size={14} />
                            {getLanguageLabel(template.language)}
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">
                          <strong>Subject:</strong> {template.subject}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setNewTemplate({ 
                              id: template.id,
                              name: template.name,
                              subject: template.subject,
                              body: template.body,
                              group: template.group,
                              language: template.language,
                              createdAt: template.createdAt
                            });
                            setShowTemplateForm(true);
                          }}
                          className="text-blue-600 hover:text-blue-800 p-1"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => deleteTemplate(template.id)}
                          className="text-red-600 hover:text-red-800 p-1"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans">
                        {template.body}
                      </pre>
                    </div>
                    <div className="mt-3 text-xs text-gray-500">
                      Created: {template.createdAt}
                    </div>
                  </div>
                ))}
                {getFilteredTemplates().length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    <FileText size={48} className="mx-auto mb-4 text-gray-300" />
                    <p>No templates found for the selected group.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Contacts Table */
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left">
                      <input
                        type="checkbox"
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedContacts(new Set(getFilteredContacts().map(c => c.id)));
                          } else {
                            setSelectedContacts(new Set());
                          }
                        }}
                        className="rounded border-gray-300"
                      />
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Contact</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Company</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Group</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Last Contacted</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {getFilteredContacts().map(contact => (
                    <tr key={contact.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedContacts.has(contact.id)}
                          onChange={() => toggleContactSelection(contact.id)}
                          className="rounded border-gray-300"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium text-gray-900">{contact.name}</div>
                          <div className="text-sm text-gray-500">{contact.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">{contact.company}</td>
                      <td className="px-6 py-4">
                        <select
                          value={contact.status}
                          onChange={(e) => updateContactStatus(contact.id, e.target.value)}
                          className="text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        >
                          {statusOptions.map(option => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={contact.group}
                          onChange={(e) => updateContactGroup(contact.id, e.target.value)}
                          className="text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        >
                          {customGroups.map(group => (
                            <option key={group.id} value={group.id}>
                              {group.label}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {contact.lastContacted || 'Never'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {contact.notes}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Modals would continue here... */}
        {/* I'll add the rest in the next message to avoid truncation */}

        {/* Add Contact Modal */}
        {showNewContactForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">Add New Contact</h2>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Name"
                  value={newContact.name}
                  onChange={(e) => setNewContact(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={newContact.email}
                  onChange={(e) => setNewContact(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <input
                  type="text"
                  placeholder="Company"
                  value={newContact.company}
                  onChange={(e) => setNewContact(prev => ({ ...prev, company: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <select
                  value={newContact.group}
                  onChange={(e) => setNewContact(prev => ({ ...prev, group: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {customGroups.map(group => (
                    <option key={group.id} value={group.id}>
                      {group.label}
                    </option>
                  ))}
                </select>
                <textarea
                  placeholder="Notes"
                  value={newContact.notes}
                  onChange={(e) => setNewContact(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowNewContactForm(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={addNewContact}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add Contact
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add Group Modal */}
        {showNewGroupForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">Add New Group</h2>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Group Name"
                  value={newGroup.label}
                  onChange={(e) => setNewGroup(prev => ({ ...prev, label: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
                  <div className="grid grid-cols-4 gap-2">
                    {colorOptions.map(color => (
                      <button
                        key={color}
                        onClick={() => setNewGroup(prev => ({ ...prev, color }))}
                        className={`p-3 rounded-lg border-2 ${
                          newGroup.color === color ? 'border-blue-500' : 'border-gray-200'
                        } ${color}`}
                      >
                        Sample
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowNewGroupForm(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={addNewGroup}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Add Group
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add Template Modal */}
        {showTemplateForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
              <h2 className="text-xl font-bold mb-4">
                {newTemplate.id ? 'Edit Template' : 'Add New Template'}
              </h2>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Template Name"
                  value={newTemplate.name}
                  onChange={(e) => setNewTemplate(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <div className="grid grid-cols-2 gap-4">
                  <select
                    value={newTemplate.group}
                    onChange={(e) => setNewTemplate(prev => ({ ...prev, group: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {customGroups.map(group => (
                      <option key={group.id} value={group.id}>
                        {group.label}
                      </option>
                    ))}
                  </select>
                  <select
                    value={newTemplate.language}
                    onChange={(e) => setNewTemplate(prev => ({ ...prev, language: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {languageOptions.map(lang => (
                      <option key={lang.value} value={lang.value}>
                        {lang.label}
                      </option>
                    ))}
                  </select>
                </div>
                <input
                  type="text"
                  placeholder="Subject Line"
                  value={newTemplate.subject}
                  onChange={(e) => setNewTemplate(prev => ({ ...prev, subject: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <textarea
                  placeholder="Email Body (use {{name}}, {{company}}, {{email}} for personalization)"
                  value={newTemplate.body}
                  onChange={(e) => setNewTemplate(prev => ({ ...prev, body: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={12}
                />
                <div className="text-sm text-gray-600">
                  <p><strong>Available variables:</strong> {`{{name}}, {{company}}, {{email}}`}</p>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowTemplateForm(false);
                    setNewTemplate({
                      id: null,
                      name: '',
                      subject: '',
                      body: '',
                      group: 'prospects',
                      language: 'en',
                      createdAt: null
                    });
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={addNewTemplate}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  {newTemplate.id ? 'Update Template' : 'Add Template'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* AI Template Generator Modal */}
        {showAiTemplateGenerator && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Wand2 className="text-indigo-600" size={24} />
                AI Template Generator
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    What&apos;s the purpose of this email?
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Investment opportunity, Partnership proposal, Product demo"
                    value={aiTemplateGenerator.purpose}
                    onChange={(e) => setAiTemplateGenerator(prev => ({ ...prev, purpose: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tone</label>
                    <select
                      value={aiTemplateGenerator.tone}
                      onChange={(e) => setAiTemplateGenerator(prev => ({ ...prev, tone: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {toneOptions.map(tone => (
                        <option key={tone.value} value={tone.value}>
                          {tone.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
                    <select
                      value={aiTemplateGenerator.language}
                      onChange={(e) => setAiTemplateGenerator(prev => ({ ...prev, language: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {languageOptions.map(lang => (
                        <option key={lang.value} value={lang.value}>
                          {lang.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Target Group</label>
                    <select
                      value={aiTemplateGenerator.targetGroup}
                      onChange={(e) => setAiTemplateGenerator(prev => ({ ...prev, targetGroup: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {customGroups.map(group => (
                        <option key={group.id} value={group.id}>
                          {group.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    About your company (optional)
                  </label>
                  <textarea
                    placeholder="Brief description of your company, what you do, key achievements..."
                    value={aiTemplateGenerator.companyInfo}
                    onChange={(e) => setAiTemplateGenerator(prev => ({ ...prev, companyInfo: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Additional context (optional)
                  </label>
                  <textarea
                    placeholder="Any specific points you want to include, call-to-action, meeting requests..."
                    value={aiTemplateGenerator.additionalContext}
                    onChange={(e) => setAiTemplateGenerator(prev => ({ ...prev, additionalContext: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                  />
                </div>
                
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>💡 Tip:</strong> The more specific information you provide, the better and more personalized your AI-generated template will be.
                  </p>
                </div>
              </div>
              
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowAiTemplateGenerator(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                  disabled={aiTemplateGenerator.generating}
                >
                  Cancel
                </button>
                <button
                  onClick={generateAiTemplate}
                  disabled={!aiTemplateGenerator.purpose.trim() || aiTemplateGenerator.generating}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {aiTemplateGenerator.generating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Generating...
                    </>
                  ) : (
                    <>
                      <Wand2 size={16} />
                      Generate Template
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Email Composer Modal */}
        {showEmailComposer && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
              <h2 className="text-xl font-bold mb-4">Compose Email</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Recipients ({selectedContacts.size} selected)
                  </label>
                  <div className="text-sm text-gray-600 max-h-20 overflow-y-auto border rounded px-3 py-2">
                    {contacts.filter(c => selectedContacts.has(c.id)).map(c => c.email).join(', ')}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Template
                  </label>
                  <select
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                    onChange={(e) => {
                      const template = emailTemplates.find(t => t.id === parseInt(e.target.value));
                      if (template) {
                        setEmailComposer(prev => ({
                          ...prev,
                          subject: template.subject,
                          body: template.body
                        }));
                      }
                    }}
                  >
                    <option value="">Choose a template</option>
                    {emailTemplates.map(template => (
                      <option key={template.id} value={template.id}>
                        {template.name} ({customGroups.find(g => g.id === template.group)?.label})
                      </option>
                    ))}
                  </select>
                </div>
                <input
                  type="text"
                  placeholder="Subject"
                  value={emailComposer.subject}
                  onChange={(e) => setEmailComposer(prev => ({ ...prev, subject: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <textarea
                  placeholder="Email body (use {{name}}, {{company}} for personalization)"
                  value={emailComposer.body}
                  onChange={(e) => setEmailComposer(prev => ({ ...prev, body: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={10}
                />
                <div className="text-sm text-gray-600">
                  <p><strong>Available variables:</strong> {`{{name}}, {{company}}, {{email}}`}</p>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowEmailComposer(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={sendBulkEmail}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Send Email
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OutreachSystem;
