using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Xml;
using System.Xml.Schema;
using System.Xml.Serialization;
using XsdToCode.Example.Extensions;

namespace XsdToCode.Example
{
    class Program
    {
        static void Main(string[] args)
        {
            
            Console.WriteLine("'Empoyees' object with 'EmployeeBase' Children");
            Console.WriteLine("'EmployeeBase' can be both 'Manager' and 'Developer'");
            TestAbstractClasses();

            ValidateSchema(@"C:\Users\david\Documents\GitHub\xsd-to-code\tests\test-schemas\game.xml", @"C:\Users\david\Documents\GitHub\xsd-to-code\tests\test-schemas\game.xsd");

            Console.ReadLine();


            Console.WriteLine("Press [Enter] to exit");
        


        }


        static void TestAbstractClasses()
        {
            var o = new Tests.AbstractClasses.Employees
            {
                EmployeeBaseList = new List<Tests.AbstractClasses.EmployeeBase> {
                    new Tests.AbstractClasses.Developer { Skill = 7, Name = "David"},
                    new Tests.AbstractClasses.EmployeeBase.Manager { Age = 44, Name = "Ansgar"},
                    new Tests.AbstractClasses.EmployeeBase {Name = "Linda"},
                    new Tests.AbstractClasses.Developer {  Name = "Lennart", Skill = 4}
                }
            };

            var prevcolor = Console.ForegroundColor;
            Console.ForegroundColor = ConsoleColor.Yellow;
            Console.WriteLine(o.Serialize());
            Console.ForegroundColor = prevcolor;

          
        }


        public static bool ValidateSchema(string xmlPath, string xsdPath)
        {
            XmlDocument xml = new XmlDocument();
            xml.Load(xmlPath);

            xml.Schemas.Add(null, xsdPath);

            try
            {
                xml.Validate(null);
                Console.WriteLine("Valid");
            }
            catch (XmlSchemaValidationException ex)
            {
                Console.WriteLine(ex.Message);
                Console.WriteLine("Not valid");
                return false;
            }
            return true;
        }


    }



}
