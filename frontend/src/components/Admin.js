import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Dashboard from './Dashboard';
import { Worker, Viewer } from '@react-pdf-viewer/core';
import '@react-pdf-viewer/core/lib/styles/index.css';
import styles from './Admin.module.css';
import CouncilsAndOrganizations from './CouncilsAndOrganizations';
import EventTable from './EventTable'; 
import AddUserModal from './AddUserModal';
import EventTableapproved from './EventTableapproved';
import logo from "../assets/urslogo.png";
import { House,Building2, CalendarPlus,CalendarCheck, Users, User, FilePenLine } from "lucide-react";
import AdminPanel from "./AdminPanel"; 
import EventHistory from './EventHistory';
import ReportForm from "./ReportForm";
const Admin = () => {

    const [showAddCouncilForm, setShowAddCouncilForm] = useState(false);
    const [activeComponent, setActiveComponent] = useState('Dashboard');
    const [events, setEvents] = useState([]);
    const [councils, setCouncils] = useState([]);
    const [users, setUsers] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDocument, setSelectedDocument] = useState(null);
    const [selectedDocumentName, setSelectedDocumentName] = useState(null); 
    const [showDocumentModal, setShowDocumentModal] = useState(false);
    
    const navigate = useNavigate();
    useEffect(() => {
        if (activeComponent === 'Events') {
            const fetchEvents = async () => {
                try {
                    const response = await axios.get('http://localhost:5000/api/events'); 
                    setEvents(response.data);
                } catch (error) {
                    console.error('Error fetching events:', error);
                }
            };

            fetchEvents();
        }
    }, [activeComponent]);
    // Fetch councils from the backend API when 'councils' is selected
    useEffect(() => {
        const fetchCouncils = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/councils');
                const data = await response.json();
    
                if (response.ok) {
                    setCouncils(data); // Set councils state with fetched data
                } else {
                    console.error('Failed to fetch councils:', data.message);
                }
            } catch (error) {
                console.error('Error fetching councils:', error);
            }
        };
    
        if (activeComponent === 'Councils') {
            fetchCouncils();
        }
    }, [activeComponent]);
    // Fetch users from the backend API when 'users' is selected
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/users');
                const data = await response.json();
    
                if (response.ok) {
                    setUsers(data); // Set Users state with fetched data
                } else {
                    console.error('Failed to fetch users:', data.message);
                }
            } catch (error) {
                console.error('Error fetching users:', error);
            }
        };
    
        if (activeComponent === 'Users') {
            fetchUsers();
        }
    }, [activeComponent]);

    const handleAddUser = (newUser) => {
        setUsers([...users, newUser]);
    };

    

    useEffect(() => {
        axios.get('http://localhost:5000/api/events')  // Update URL to point to the correct port
            .then(response => {
                setEvents(response.data);
            })
            .catch(error => console.error('Error fetching events:', error));
    }, []);



    // para sa delete button
   const handleDelete = async (eventId, organization) => {
    console.log('Attempting to delete event with ID:', eventId);

    const confirmed = window.confirm('Are you sure you want to delete this event?');
    if (!confirmed) return;

    try {
        // Step 1: Delete the event
        const response = await fetch(`http://localhost:5000/api/events/${eventId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        const responseBody = await response.json();
        console.log('Response body:', responseBody);

        if (response.ok) {
            // Step 2: Notify the organization about the deletion
            console.log(`Notifying organization: ${organization}`);
            await sendEventNotification(organization, eventId); // Send email notification

            alert('Event deleted successfully');
            setEvents(prevEvents => prevEvents.filter(event => event.id !== eventId)); // Remove event from the UI
        } else {
            console.error('Delete failed:', responseBody);
            alert(`Failed to delete event: ${responseBody.message || 'Unknown error'}`);
        }
    } catch (error) {
        console.error('Error deleting event:', error);
        alert('Error deleting event');
    }
};

// Function to send notification to the organization
const sendEventNotification = async (organization, eventId) => {
    try {
        const response = await fetch('http://localhost:5000/api/send-event-notification', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ organization, eventId }),
        });

        const responseBody = await response.json();
        console.log('Notification Response:', responseBody);
        if (response.ok) {
            console.log('Notification sent to organization email');
        } else {
            console.error('Failed to send notification:', responseBody.message);
        }
    } catch (error) {
        console.error('Error sending notification:', error);
    }
};

    
    


    
// para sa approve button
const handleConfirm = async (eventId) => {
    console.log('Attempting to approve event with ID:', eventId);

    const confirmed = window.confirm('Are you sure you want to approve this event?');
    if (!confirmed) return;

    try {
        const response = await fetch(`http://localhost:5000/api/events/approve/${eventId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        const responseBody = await response.json(); // Get the response body
        console.log('Response body:', responseBody); // Log the response body

        if (response.ok) {
            console.log('Approve response:', responseBody);
            alert('Event approved successfully!');
            setEvents(prevEvents => prevEvents.filter(event => event.id !== eventId));
        } else {
            console.error('Approval failed:', responseBody);
            alert(`Failed to approve event: ${responseBody.message || 'Unknown error'}`);
        }
    } catch (error) {
        console.error('Error approving event:', error);
        alert('Error approving event');
    }
};
const handleLogout = () => {
    
    sessionStorage.clear(); 
  
    
    navigate("/login", { replace: true });
  };
    const handleViewDocument = (documentName) => {
        // Construct the URL for the document in the 'uploads' folder
        const fullDocumentUrl = `http://localhost:5000/uploads/${documentName}`;
    
        // Log the URL for debugging
        console.log("Document URL:", fullDocumentUrl);
    
        // Set the document and show modal
        setSelectedDocument(fullDocumentUrl);
        setSelectedDocumentName(documentName);
        setShowDocumentModal(true);
    };
    const handleCloseDocumentModal = () => {
        setShowDocumentModal(false);
        setSelectedDocument(null);
        setSelectedDocumentName(null); // Reset the document name when closing
    };
    const handleViewImage = (imageName) => {
        // Construct the URL for the image in the 'uploads' folder
        const fullImageUrl = `http://localhost:5000/uploads/${imageName}`;
        
        // Log the URL for debugging
        console.log("Image URL:", fullImageUrl);
        
        // Set the image and show modal
        setSelectedDocument(fullImageUrl); // Reusing the same state for simplicity
        setSelectedDocumentName(imageName); // Reusing the same state for image name
        setShowDocumentModal(true);
    };
    const handleButtonHover = (event, isHovering) => {
        if (isHovering) {
            event.target.style.backgroundColor = '#034d8c'; // Darker shade on hover
        } else {
            event.target.style.backgroundColor = '#0e4296'; // Original color
        }
    };


    // Function to render the selected content in the main content area
    const renderContent = () => {
        switch (activeComponent) {
            case 'Dashboard':
                return <Dashboard />;
            case 'Events':
                return (
                    <div className={styles.adminContainer}>
                    <div className={styles.eventtablecontainer}>
                    <EventTable
                      events={events}
                      handleViewDocument={handleViewDocument}
                      handleViewImage={handleViewImage}
                      handleConfirm={handleConfirm}
                      handleDelete={handleDelete}
                      handleButtonHover={handleButtonHover}
                    />
                    </div>
                    {/* Document Modal */}
            {showDocumentModal && (
                <div className={styles.modalBackdrop} onClick={handleCloseDocumentModal}>
                    <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                        <h3>{selectedDocumentName}</h3> {/* Display the document name */}
                        
                        {selectedDocumentName?.endsWith('.pdf') ? (
                            <Worker workerUrl={`https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js`}>
                                <Viewer fileUrl={selectedDocument} />
                            </Worker>
                        ) : (
                            <img src={selectedDocument} alt={selectedDocumentName} className={{ width: '100%', height: 'auto' }} />
                        )}

                        <button className={styles.closeButton} onClick={handleCloseDocumentModal}>
                            Close
                        </button>
                    </div>
                </div>
            )}
                  </div>
                );
                case 'ApproveEvents':
                return <EventTableapproved />;
                case 'Councils':
                    return (
                        <div>
                        {/* Your other Admin content */}
                        <CouncilsAndOrganizations
                          councils={councils}
                          showAddCouncilForm={showAddCouncilForm}
                          setShowAddCouncilForm={setShowAddCouncilForm}
                        />
                      </div>
                    );
            case 'Users':
                return (
                    <div>
                        
                        <h2 >Users</h2>
                       
                        <div className={styles.sectionBox}>
                        <table className={styles.table}>
                        <div >
                    
                    <button className={styles.addButton} onClick={() => setIsModalOpen(true)}>Add User</button>
                    <AddUserModal 
                        isOpen={isModalOpen} 
                        closeModal={() => setIsModalOpen(false)} 
                        addUser={handleAddUser}
                    /> 
                    
                    </div>
<table className={styles.table}>
    <thead>
        <tr className={styles.tableHeader}>
            <th className={styles.tableCell}>Name</th>
            <th className={styles.tableCell}>Organization</th>
            <th className={styles.tableCell}>Username</th>
            <th className={styles.tableCell}>Email</th>
            <th className={styles.tableCell}>Password</th>
            
            
            
        </tr>
    </thead>
    <tbody>
        {users.length > 0 ? (
            users.map((users) => (
                <tr key={users.id} className={styles.tableRow}>
                    <td className={styles.tableCell}>{users.name}</td>
                    <td className={styles.tableCell}>{users.organizationz}</td>
                    <td className={styles.tableCell}>{users.username}</td>
                    <td className={styles.tableCell}>{users.email}</td>
                    <td className={styles.tableCell}>{users.password}</td>
                </tr>
            ))
        ) : (
            <tr>
                <td colSpan="8" className={styles.noEvents}>No council available</td>
            </tr>
        )}
    </tbody>   
</table>
</table>
    </div>                  
</div>
);
    case 'Reports':
        return <div className={styles.sectionBox}><div>
         <div>
      <h1>Admin Dashboard</h1>
      <AdminPanel />
    </div>
      </div>
    </div>;
       case 'History':
        return <div className={styles.sectionBox}><div>
         <div>
      <EventHistory />
    </div>
      </div></div>;
         default:
     return <div className={styles.sectionBox}>This is the Dashboard section</div>;
        }
};

    return (
        <div className={styles.container}>
            {/* Navbar */}
            <nav className={styles.navbar}>
        <div className={styles.logoContainer}>
          <img src={logo} alt="Logo" className={styles.logo} />
          <div className={styles.titleflex}>
            <h1 className={styles.title}>
              University of Rizal System - Antipolo Campus
            </h1>
            <h1 className={styles.subtitle}>Event Booking System</h1>
          </div>
        </div>
        <button className={styles.logoutButton} onClick={handleLogout}>
                    Logout
                </button>
      </nav>

            {/* Sidebar and main content */}
            <div className={styles.main}>
                {/* Sidebar */}
                <aside className={styles.sidebar}>
                <ul className={styles.sidebarList}>
    <li
        className={`${styles.sidebarItem} ${activeComponent === 'Dashboard' ? styles.activeSidebarItem : ''}`}
        onClick={() => setActiveComponent('Dashboard')}
    >
        <House size={20} color="#f2f8ff" />
        <span>Dashboard</span> {/* Text to be hidden on small screens */}
    </li>
    <li
        className={`${styles.sidebarItem} ${activeComponent === 'Events' ? styles.activeSidebarItem : ''}`}
        onClick={() => setActiveComponent('Events')}
    >
        <CalendarPlus size={20} color="#f2f8ff" />
        <span>Pending Events</span>
    </li>
    <li
        className={`${styles.sidebarItem} ${activeComponent === 'ApproveEvents' ? styles.activeSidebarItem : ''}`}
        onClick={() => setActiveComponent('ApproveEvents')}
    >
        <CalendarCheck size={20} color="#f2f8ff" />
        <span>Approved Events</span>
    </li>
    <li
        className={`${styles.sidebarItem} ${activeComponent === 'Councils' ? styles.activeSidebarItem : ''}`}
        onClick={() => setActiveComponent('Councils')}
    >
        <Users size={20} color="#f2f8ff" />
        <span>Councils and Organizations</span>
    </li>
    <li
        className={`${styles.sidebarItem} ${activeComponent === 'Users' ? styles.activeSidebarItem : ''}`}
        onClick={() => setActiveComponent('Users')}
    >
        <User size={20} color="#f2f8ff" />
        <span>Users</span>
    </li>
    <li
        className={`${styles.sidebarItem} ${activeComponent === 'Reports' ? styles.activeSidebarItem : ''}`}
        onClick={() => setActiveComponent('Reports')}
    >
        <FilePenLine size={20} color="#f2f8ff" />
        <span>Reports</span>
    </li>
    <li
        className={`${styles.sidebarItem} ${activeComponent === 'History' ? styles.activeSidebarItem : ''}`}
        onClick={() => setActiveComponent('History')}
    >
        <FilePenLine size={20} color="#f2f8ff" />
        <span>History</span>
    </li>
</ul>

                </aside>

                {/* Main Content Area */}
                <main className={styles.content}>
                    {renderContent()}
                </main>
            </div>

            
        </div>
    );
};

export default Admin;
