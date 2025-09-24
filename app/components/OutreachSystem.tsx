'use client';

import React, { useState, useEffect } from 'react';
import { Users, Mail, Send, Plus, Edit, Trash2, UserCheck, UserX, Clock, FileText, Wand2, Globe, Upload, Download } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Apps Script Configuration
const APPS_SCRIPT_CONFIG = {
  WEB_APP_URL: 'https://script.google.com/macros/s/AKfycbzxqIF5ZH3i3i2_xdZlRGkGDgG36BGh8d_3HCyvrvoz3c2GCx1Cqu_v6iEc0wZPspE9mA/exec', // Replace with your deployed Apps Script URL
  TIMEOUT: 30000, // 30 seconds timeout
};

const OutreachSystem = () => {
  const [contacts, setContacts] = useState([]);
  const [customGroups, setCustomGroups] = useState([]);
  const [emailTemplates, setEmailTemplates] = useState([]);
  const [loading, setLoading] = useState(true);

  // Apps Script integration state
  const [emailSending, setEmailSending] = useState(false);
  const [emailStats, setEmailStats] = useState({
    dailyQuotaUsed: 0,
    dailyQuotaRemaining: 100,
    maxDailyQuota: 100
  });

  const [activeTab, setActiveTab] = useState('all');
  const [showNewContactForm, setShowNewContactForm] = useState(false);
  const [showEmailComposer, setShowEmailComposer] = useState(false);
  const [showNewGroupForm, setShowNewGroupForm] = useState(false);
  const [showTemplateForm, setShowTemplateForm] = useState(false);
  const [showAiTemplateGenerator, setShowAiTemplateGenerator] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const [selectedContacts, setSelectedContacts] = useState(new Set());
  const [selectedGroupFilter, setSelectedGroupFilter] = useState('all');
  const [importFile, setImportFile] = useState(null);
  const [importPreview, setImportPreview] = useState([]);
  const [importMapping, setImportMapping] = useState({
    name: '',
    email: '',
    company: '',
    notes: ''
  });

  const [newContact, setNewContact] = useState({
    name: '',
    email: '',
    company: '',
    status: 'not_contacted',
    notes: '',
    group_id: 'prospects'
  });

  const [newGroup, setNewGroup] = useState({
    label: '',
    color: 'bg-blue-100 text-blue-800'
  });

  const [newTemplate, setNewTemplate] = useState({
    id: null,
    name: '',
    subject: '',
    body: '',
    group_id: 'prospects',
    language: 'en',
    created_at: null
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

  // Fetch initial data from Supabase
  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      const { data: contactsData, error: contactsError } = await supabase.from('contacts').select('*');
      const { data: groupsData, error: groupsError } = await supabase.from('groups').select('*');
      const { data: templatesData, error: templatesError } = await supabase.from('email_templates').select('*');

      if (contactsError) console.error('Error fetching contacts:', contactsError);
      if (groupsError) console.error('Error fetching groups:', groupsError);
      if (templatesError) console.error('Error fetching templates:', templatesError);

      setContacts(contactsData || []);
      setCustomGroups(groupsData || []);
      setEmailTemplates(templatesData || []);
      setLoading(false);
    };

    fetchInitialData();
  }, []);

  // Fetch email stats on component mount
  useEffect(() => {
    fetchEmailStats();
  }, []);

  // Handle outside clicks for export dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showExportDropdown && !event.target.closest('.relative')) {
        setShowExportDropdown(false);
      }
    };

    if (showExportDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showExportDropdown]);

  // Fetch email stats from Apps Script
  const fetchEmailStats = async () => {
    try {
      const response = await fetch(`${APPS_SCRIPT_CONFIG.WEB_APP_URL}?action=stats`);
      if (response.ok) {
        const stats = await response.json();
        setEmailStats(stats);
      }
    } catch (error) {
      console.error('Error fetching email stats:', error);
    }
  };

  // Show detailed email results modal
  const showEmailResults = (result) => {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]';
    
    const successList = result.successful.map(s => 
      `<li class="text-green-700">✓ ${s.name} (${s.email})</li>`
    ).join('');
    
    const failureList = result.failed.map(f => 
      `<li class="text-red-700">✗ ${f.name} (${f.email}) - ${f.error}</li>`
    ).join('');
    
    modal.innerHTML = `
      <div class="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
        <h2 class="text-xl font-bold mb-4">Email Sending Results</h2>
        
        <div class="mb-6">
          <div class="grid grid-cols-2 gap-4 text-center">
            <div class="bg-green-100 p-4 rounded-lg">
              <div class="text-2xl font-bold text-green-600">${result.totalSent}</div>
              <div class="text-green-700">Emails Sent</div>
            </div>
            <div class="bg-red-100 p-4 rounded-lg">
              <div class="text-2xl font-bold text-red-600">${result.totalFailed}</div>
              <div class="text-red-700">Failed</div>
            </div>
          </div>
        </div>

        ${result.successful.length > 0 ? `
          <div class="mb-4">
            <h3 class="font-semibold text-green-700 mb-2">Successfully Sent:</h3>
            <ul class="space-y-1 max-h-40 overflow-y-auto">
              ${successList}
            </ul>
          </div>
        ` : ''}

        ${result.failed.length > 0 ? `
          <div class="mb-4">
            <h3 class="font-semibold text-red-700 mb-2">Failed to Send:</h3>
            <ul class="space-y-1 max-h-40 overflow-y-auto">
              ${failureList}
            </ul>
          </div>
        ` : ''}

        <div class="flex justify-end">
          <button id="close-results" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Close
          </button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    document.getElementById('close-results').addEventListener('click', () => {
      document.body.removeChild(modal);
    });
  };
  
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
      filtered = filtered.filter(c => c.group_id === selectedGroupFilter);
    }
    
    return filtered;
  };

  const getFilteredTemplates = () => {
    if (selectedGroupFilter === 'all') {
      return emailTemplates;
    }
    return emailTemplates.filter(t => t.group_id === selectedGroupFilter);
  };

  const updateContactStatus = async (contactId, newStatus) => {
    const { data, error } = await supabase
      .from('contacts')
      .update({ status: newStatus, last_contacted: newStatus !== 'not_contacted' ? new Date().toISOString().split('T')[0] : null })
      .eq('id', contactId)
      .select();
    
    if (error) {
      console.error('Error updating contact status:', error);
    } else {
      setContacts(prev => prev.map(c => (c.id === contactId ? data[0] : c)));
    }
  };

  const updateContactGroup = async (contactId, newGroupId) => {
    const { data, error } = await supabase
      .from('contacts')
      .update({ group_id: newGroupId })
      .eq('id', contactId)
      .select();
    
    if (error) {
      console.error('Error updating contact group:', error);
    } else {
      setContacts(prev => prev.map(c => (c.id === contactId ? data[0] : c)));
    }
  };

  const addNewContact = async () => {
    if (newContact.name && newContact.email) {
      const { data, error } = await supabase
        .from('contacts')
        .insert([{ ...newContact }])
        .select();

      if (error) {
        console.error('Error adding new contact:', error);
      } else {
        setContacts(prev => [...prev, data[0]]);
        setNewContact({
          name: '',
          email: '',
          company: '',
          status: 'not_contacted',
          notes: '',
          group_id: 'prospects'
        });
        setShowNewContactForm(false);
      }
    }
  };

  const addNewGroup = async () => {
    if (newGroup.label.trim()) {
      const group_id = newGroup.label.toLowerCase().replace(/\s+/g, '_');
      const { data, error } = await supabase
        .from('groups')
        .insert([{ id: group_id, label: newGroup.label, color: newGroup.color }])
        .select();

      if (error) {
        console.error('Error adding new group:', error);
      } else {
        setCustomGroups(prev => [...prev, data[0]]);
        setNewGroup({ label: '', color: 'bg-blue-100 text-blue-800' });
        setShowNewGroupForm(false);
      }
    }
  };

  const addNewTemplate = async () => {
    if (newTemplate.name && newTemplate.subject && newTemplate.body) {
      const templateToSave = {
        ...newTemplate,
        created_at: newTemplate.created_at || new Date().toISOString().split('T')[0]
      };
      let result;
      if (newTemplate.id) {
        // Update existing template
        result = await supabase
          .from('email_templates')
          .update(templateToSave)
          .eq('id', newTemplate.id)
          .select();
      } else {
        // Add new template
        result = await supabase
          .from('email_templates')
          .insert([templateToSave])
          .select();
      }

      if (result.error) {
        console.error('Error adding/updating template:', result.error);
      } else {
        if (newTemplate.id) {
          setEmailTemplates(prev => prev.map(t => (t.id === newTemplate.id ? result.data[0] : t)));
        } else {
          setEmailTemplates(prev => [...prev, result.data[0]]);
        }
        
        setNewTemplate({
          id: null,
          name: '',
          subject: '',
          body: '',
          group_id: 'prospects',
          language: 'en',
          created_at: null
        });
        setShowTemplateForm(false);
      }
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
      group_id: aiTemplateGenerator.targetGroup,
      language: aiTemplateGenerator.language,
      created_at: null
    };
    
    setNewTemplate(mockGeneratedTemplate);
    setAiTemplateGenerator(prev => ({ ...prev, generating: false }));
    setShowAiTemplateGenerator(false);
    setShowTemplateForm(true);
  };

  const deleteTemplate = async (templateId) => {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]';
    modal.innerHTML = `
      <div class="bg-white rounded-lg p-6 w-full max-w-sm text-center shadow-lg">
        <p class="text-lg font-semibold mb-4">Are you sure you want to delete this template?</p>
        <div class="flex justify-center gap-4">
          <button id="cancel-btn" class="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors">Cancel</button>
          <button id="confirm-btn" class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">Delete</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    document.getElementById('confirm-btn').addEventListener('click', async () => {
      const { error } = await supabase
        .from('email_templates')
        .delete()
        .eq('id', templateId);

      if (error) {
        console.error('Error deleting template:', error);
      } else {
        setEmailTemplates(prev => prev.filter(t => t.id !== templateId));
      }
      document.body.removeChild(modal);
    });

    document.getElementById('cancel-btn').addEventListener('click', () => {
      document.body.removeChild(modal);
    });
  };

  const toggleContactSelection = (contactId) => {
    setSelectedContacts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(contactId)) {
        newSet.delete(contactId);
      } else {
        newSet.add(contactId);
      }
      console.log('Selected contacts:', Array.from(newSet)); // Debug log
      return newSet;
    });
  };

  // Enhanced sendBulkEmail function with Apps Script integration
  const sendBulkEmail = async () => {
    const selectedContactIds = Array.from(selectedContacts);
    console.log('Sending emails to:', selectedContactIds);
    
    if (selectedContactIds.length === 0) {
      alert('Please select at least one contact to send emails to.');
      return;
    }

    if (!emailComposer.subject.trim() || !emailComposer.body.trim()) {
      alert('Please fill in both subject and body fields.');
      return;
    }

    // Check daily quota
    if (emailStats.dailyQuotaRemaining < selectedContactIds.length) {
      const proceed = confirm(
        `Warning: You only have ${emailStats.dailyQuotaRemaining} emails remaining in your daily quota. ` +
        `You're trying to send ${selectedContactIds.length} emails. Continue anyway?`
      );
      if (!proceed) return;
    }

    setEmailSending(true);

    try {
      // Get selected contacts data
      const selectedContactsData = contacts.filter(contact => 
        selectedContactIds.includes(contact.id)
      );

      // Prepare data for Apps Script
      const emailData = {
        contacts: selectedContactsData.map(contact => ({
          id: contact.id,
          name: contact.name,
          email: contact.email,
          company: contact.company || '',
        })),
        subject: emailComposer.subject,
        body: emailComposer.body,
        bcc: false, // Set to true if you want to BCC yourself
        trackOpens: false, // Set to true if you want to track email opens
      };

      console.log('Sending email data to Apps Script:', emailData);

      // Send to Apps Script backend
      const response = await fetch(APPS_SCRIPT_CONFIG.WEB_APP_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailData),
        signal: AbortSignal.timeout(APPS_SCRIPT_CONFIG.TIMEOUT)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Apps Script response:', result);

      if (result.error) {
        throw new Error(result.error);
      }

      // Update contact statuses in database
      const successfulContactIds = result.successful.map(s => s.contactId);
      
      if (successfulContactIds.length > 0) {
        const { error: dbError } = await supabase
          .from('contacts')
          .update({ 
            status: 'email_sent', 
            last_contacted: new Date().toISOString().split('T')[0] 
          })
          .in('id', successfulContactIds);

        if (dbError) {
          console.error('Error updating database:', dbError);
        }

        // Update local state
        setContacts(prev => prev.map(contact => 
          successfulContactIds.includes(contact.id)
            ? { ...contact, status: 'email_sent', last_contacted: new Date().toISOString().split('T')[0] }
            : contact
        ));
      }

      // Clear selections and close composer
      setSelectedContacts(new Set());
      setShowEmailComposer(false);

      // Refresh email stats
      await fetchEmailStats();

      // Show detailed results
      showEmailResults(result);
      
    } catch (error) {
      console.error('Error in sendBulkEmail:', error);
      
      let errorMessage = 'An error occurred while sending emails.';
      if (error.name === 'AbortError') {
        errorMessage = 'Email sending timed out. Please try again with fewer contacts.';
      } else if (error.message.includes('quota')) {
        errorMessage = 'Daily email quota exceeded. Please try again tomorrow.';
      } else {
        errorMessage = `Error: ${error.message}`;
      }
      
      alert(errorMessage);
    } finally {
      setEmailSending(false);
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'text/csv') {
      setImportFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        const csv = e.target?.result;
        if (typeof csv === 'string') {
          const lines = csv.split('\n');
          const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
          const preview = lines.slice(1, 6).map(line => {
            const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
            const row = {};
            headers.forEach((header, index) => {
              row[header] = values[index] || '';
            });
            return row;
          }).filter(row => Object.values(row).some(v => v));
          
          setImportPreview(preview);
          const autoMapping = {
            name: headers.find(h => /name/i.test(h)) || '',
            email: headers.find(h => /email/i.test(h)) || '',
            company: headers.find(h => /company|organization/i.test(h)) || '',
            notes: headers.find(h => /notes|description/i.test(h)) || ''
          };
          setImportMapping(autoMapping);
        }
      };
      reader.readAsText(file);
      setShowImportModal(true);
    } else {
      const messageBox = document.createElement('div');
      messageBox.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-xl animate-fade-in-down';
      messageBox.innerHTML = 'Please select a valid CSV file.';
      document.body.appendChild(messageBox);

      setTimeout(() => {
        messageBox.classList.remove('animate-fade-in-down');
        messageBox.classList.add('animate-fade-out-up');
        setTimeout(() => {
          document.body.removeChild(messageBox);
        }, 500);
      }, 3000);
    }
  };

  const processImport = async () => {
    if (!importFile) return;
    
    const reader = new FileReader();
    reader.onload = async (e) => {
      const csv = e.target?.result;
      if (typeof csv === 'string') {
        const lines = csv.split('\n');
        const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
        
        const contactsToInsert = lines.slice(1).map((line) => {
          const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
          const row = {};
          headers.forEach((header, idx) => {
            row[header] = values[idx] || '';
          });
          
          return {
            name: row[importMapping.name] || 'Unknown',
            email: row[importMapping.email] || '',
            company: row[importMapping.company] || '',
            notes: row[importMapping.notes] || '',
            status: 'not_contacted',
            group_id: 'prospects',
          };
        }).filter(contact => contact.email); 

        const { data, error } = await supabase
          .from('contacts')
          .insert(contactsToInsert)
          .select();

        if (error) {
          console.error('Error importing contacts:', error);
        } else {
          setContacts(prev => [...prev, ...data]);
        }
        
        setShowImportModal(false);
        setImportFile(null);
        setImportPreview([]);
        
        const messageBox = document.createElement('div');
        messageBox.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-xl animate-fade-in-down';
        messageBox.innerHTML = `Successfully imported ${contactsToInsert.length} contacts!`;
        document.body.appendChild(messageBox);
    
        setTimeout(() => {
          messageBox.classList.remove('animate-fade-in-down');
          messageBox.classList.add('animate-fade-out-up');
          setTimeout(() => {
            document.body.removeChild(messageBox);
          }, 500);
        }, 3000);
      }
    };
    reader.readAsText(importFile);
  };

  const exportContacts = (format = 'csv') => {
    const contactsToExport = getFilteredContacts();
    
    if (format === 'csv') {
      const headers = ['name', 'email', 'company', 'status', 'group_id', 'last_contacted', 'notes'];
      const csvData = [
        headers.join(','),
        ...contactsToExport.map(contact => [
          `"${contact.name}"`,
          `"${contact.email}"`,
          `"${contact.company}"`,
          `"${contact.status}"`,
          `"${contact.group_id}"`,
          `"${contact.last_contacted || 'Never'}"`,
          `"${contact.notes}"`
        ].join(','))
      ].join('\n');
      
      const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `outreach-contacts-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else if (format === 'json') {
      const jsonData = JSON.stringify(contactsToExport, null, 2);
      const blob = new Blob([jsonData], { type: 'application/json;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `outreach-contacts-${new Date().toISOString().split('T')[0]}.json`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const exportTemplates = () => {
    const templatesToExport = getFilteredTemplates();
    const jsonData = JSON.stringify(templatesToExport, null, 2);
    const blob = new Blob([jsonData], { type: 'application/json;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `email-templates-${new Date().toISOString().split('T')[0]}.json`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-700 font-medium">Loading data...</p>
        </div>
      </div>
    );
  }

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
            <div className="flex gap-3 items-center">
              {/* Email Quota Display */}
              <div className="text-sm text-gray-600 bg-gray-100 px-3 py-2 rounded-lg">
                Daily Quota: {emailStats.dailyQuotaUsed}/{emailStats.maxDailyQuota} used
                ({emailStats.dailyQuotaRemaining} remaining)
              </div>

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
                  <button
                    onClick={exportTemplates}
                    className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                  >
                    <Download size={18} />
                    Export Templates
                  </button>
                </>
              ) : (
                <>
                  <label className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors cursor-pointer">
                    <Upload size={18} />
                    Import CSV
                    <input
                      type="file"
                      accept=".csv"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                  <div className="relative">
                    <button 
                      onClick={() => setShowExportDropdown(!showExportDropdown)}
                      className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                    >
                      <Download size={18} />
                      Export {showExportDropdown ? '▲' : '▼'}
                    </button>
                    {showExportDropdown && (
                      <div className="absolute top-full left-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg z-50 w-48">
                        <div className="py-1">
                          <button
                            onClick={() => {
                              exportContacts('csv');
                              setShowExportDropdown(false);
                            }}
                            className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 block"
                          >
                            📄 Export as CSV
                          </button>
                          <div className="border-t border-gray-200"></div>
                          <button
                            onClick={() => {
                              exportContacts('json');
                              setShowExportDropdown(false);
                            }}
                            className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 block"
                          >
                            📋 Export as JSON
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => setShowNewContactForm(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                  >
                    <Plus size={18} />
                    Add Contact
                  </button>
                  <button
                    onClick={() => setShowEmailComposer(true)}
                    className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                      selectedContacts.size === 0 
                        ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                        : emailSending
                        ? 'bg-yellow-500 text-white cursor-wait'
                        : 'bg-green-600 hover:bg-green-700 text-white'
                    }`}
                    disabled={selectedContacts.size === 0 || emailSending}
                    title={
                      selectedContacts.size === 0 
                        ? 'Select contacts first' 
                        : emailSending 
                        ? 'Sending emails...' 
                        : `Send email to ${selectedContacts.size} selected contacts`
                    }
                  >
                    {emailSending ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send size={18} />
                        Send Email ({selectedContacts.size})
                      </>
                    )}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Rest of your existing JSX remains the same until the Email Composer Modal */}

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
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${customGroups.find(g => g.id === template.group_id)?.color || 'bg-gray-100 text-gray-800'}`}>
                            {customGroups.find(g => g.id === template.group_id)?.label || template.group_id}
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
                              group_id: template.group_id,
                              language: template.language,
                              created_at: template.created_at
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
                      Created: {template.created_at}
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
                          value={contact.group_id}
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
                        {contact.last_contacted || 'Never'}
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

        {/* All existing modals remain the same until Email Composer Modal */}

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
                  value={newContact.group_id}
                  onChange={(e) => setNewContact(prev => ({ ...prev, group_id: e.target.value }))}
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
                    value={newTemplate.group_id}
                    onChange={(e) => setNewTemplate(prev => ({ ...prev, group_id: e.target.value }))}
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
                      group_id: 'prospects',
                      language: 'en',
                      created_at: null
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

        {/* Enhanced Email Composer Modal */}
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
                        {template.name} ({customGroups.find(g => g.id === template.group_id)?.label})
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

                {/* Quota Warning */}
                {emailStats.dailyQuotaRemaining < selectedContacts.size && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <p className="text-sm text-yellow-800">
                      <strong>⚠️ Quota Warning:</strong> You only have {emailStats.dailyQuotaRemaining} emails 
                      remaining in your daily quota, but you're trying to send to {selectedContacts.size} contacts.
                    </p>
                  </div>
                )}
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowEmailComposer(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                  disabled={emailSending}
                >
                  Cancel
                </button>
                <button
                  onClick={sendBulkEmail}
                  disabled={emailSending || !emailComposer.subject.trim() || !emailComposer.body.trim()}
                  className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                    emailSending || !emailComposer.subject.trim() || !emailComposer.body.trim()
                      ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                      : 'bg-green-600 hover:bg-green-700 text-white'
                  }`}
                >
                  {emailSending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send size={16} />
                      Send Email
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Import CSV Modal remains the same */}
        {showImportModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[80vh] overflow-y-auto">
              <h2 className="text-xl font-bold mb-4">Import Contacts from CSV</h2>
              
              {importPreview.length > 0 && (
                <>
                  <div className="mb-6">
                    <h3 className="text-lg font-medium mb-3">Map CSV Columns</h3>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Name Column</label>
                        <select
                          value={importMapping.name}
                          onChange={(e) => setImportMapping(prev => ({ ...prev, name: e.target.value }))}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">Select column...</option>
                          {Object.keys(importPreview[0] || {}).map(header => (
                            <option key={header} value={header}>{header}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email Column</label>
                        <select
                          value={importMapping.email}
                          onChange={(e) => setImportMapping(prev => ({ ...prev, email: e.target.value }))}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">Select column...</option>
                          {Object.keys(importPreview[0] || {}).map(header => (
                            <option key={header} value={header}>{header}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Company Column</label>
                        <select
                          value={importMapping.company}
                          onChange={(e) => setImportMapping(prev => ({ ...prev, company: e.target.value }))}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">Select column...</option>
                          {Object.keys(importPreview[0] || {}).map(header => (
                            <option key={header} value={header}>{header}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Notes Column</label>
                        <select
                          value={importMapping.notes}
                          onChange={(e) => setImportMapping(prev => ({ ...prev, notes: e.target.value }))}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">Select column...</option>
                          {Object.keys(importPreview[0] || {}).map(header => (
                            <option key={header} value={header}>{header}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="mb-6">
                    <h3 className="text-lg font-medium mb-3">Preview (First 5 rows)</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full border border-gray-200 rounded-lg">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Name</th>
                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Email</th>
                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Company</th>
                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Notes</th>
                          </tr>
                        </thead>
                        <tbody>
                          {importPreview.map((row, index) => (
                            <tr key={index} className="border-t border-gray-200">
                              <td className="px-4 py-2 text-sm">{row[importMapping.name] || '-'}</td>
                              <td className="px-4 py-2 text-sm">{row[importMapping.email] || '-'}</td>
                              <td className="px-4 py-2 text-sm">{row[importMapping.company] || '-'}</td>
                              <td className="px-4 py-2 text-sm">{row[importMapping.notes] || '-'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg mb-6">
                    <p className="text-sm text-blue-800">
                      <strong>📋 Import Settings:</strong>
                    </p>
                    <ul className="text-sm text-blue-700 mt-2 space-y-1">
                      <li>• All imported contacts will be set to &quot;Not Contacted&quot; status</li>
                      <li>• Contacts will be added to the &quot;Prospects&quot; group by default</li>
                      <li>• Only rows with email addresses will be imported</li>
                      <li>• Duplicates will be added as separate entries</li>
                    </ul>
                  </div>
                </>
              )}

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowImportModal(false);
                    setImportFile(null);
                    setImportPreview([]);
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={processImport}
                  disabled={!importMapping.email || importPreview.length === 0}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Import {importPreview.length} Contacts
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
